import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Server-side Gemini client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Helper to call Gemini with multi-model fallback so 503/high-demand errors are bypassed
  async function callGemini(contents: string, responseSchema: any) {
    const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
    let lastError: any = null;
    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            responseMimeType: 'application/json',
            responseSchema,
          },
        });
        if (response.text) {
          return JSON.parse(response.text);
        }
      } catch (err: any) {
        console.warn(`[Gemini] Model ${model} failed (${err?.status || err?.message}), checking next candidate...`);
        lastError = err;
      }
    }
    throw lastError || new Error('All Gemini model candidates failed');
  }

  // Dynamic intelligent fallback in the rare event network or API is completely offline
  function generateSmartCreativeFallback(taskTitle: string, durationMinutes: number, style?: string) {
    const title = (taskTitle || 'Quest').trim();
    const dur = Number(durationMinutes) || 45;
    const isShortOrCryptic = /^[a-zA-Z0-9_\-]{2,7}$/.test(title);

    if (isShortOrCryptic) {
      const acronym = title.toUpperCase();
      return {
        creativeTheme: `Operation ${acronym}: The High-Octane Decryption Sprint`,
        isTooBig: dur > 50,
        frictionAnalysis: `Cryptic objective "${title}" triggers subconscious hesitation because the victory condition isn't crystal clear. Framing it as a tactical operation strips out the overwhelm.`,
        recommendedTotalMinutes: dur,
        subtasks: [
          {
            title: `Decode Parameters: Jot down the top 3 deliverables for ${title}`,
            estimatedMinutes: Math.max(5, Math.round(dur * 0.15)),
            frictionReductionTip: 'Define what "victory" looks like on a single sticky note before touching tools.',
          },
          {
            title: `Kinetic Launch: 15-minute blitz on the heaviest piece with zero tab-switching`,
            estimatedMinutes: Math.round(dur * 0.55),
            frictionReductionTip: 'Use the 5-second countdown rule: 5-4-3-2-1, begin without debating.',
          },
          {
            title: `Boss Defeat: Polish, save checkpoints, and plant the victory flag`,
            estimatedMinutes: Math.max(5, Math.round(dur * 0.3)),
            frictionReductionTip: 'Stand up and celebrate physically the moment the timer rings.',
          },
        ],
        temptationBundleSuggestion: 'Pair with an ice-cold specialty drink or 15 minutes of guilt-free video game time right after.',
        proTip: 'Done beats perfect every single time. Momentum is built by closing loops, not pondering them.',
      };
    }

    return {
      creativeTheme: `Sprint: Defeating "${title}" in Style`,
      isTooBig: dur > 50,
      frictionAnalysis: `Large tasks create initiation friction when the start point is blurry. A micro-onramp turns a mountain into small stepping stones.`,
      recommendedTotalMinutes: dur,
      subtasks: [
        {
          title: `Low-Friction Ignition: Set up the stage and outline the first 3 moves for ${title}`,
          estimatedMinutes: Math.max(5, Math.round(dur * 0.15)),
          frictionReductionTip: 'Commit only to 3 minutes of setup. The brain lowers its shields once you touch the tools.',
        },
        {
          title: `Deep Flow Sprint: Tackle the core substance in single-task focus`,
          estimatedMinutes: Math.round(dur * 0.6),
          frictionReductionTip: 'Put phone into airplane mode or another room. Silence all mental pop-ups.',
        },
        {
          title: `Victory Pass: Quality check, tidy artifacts, and claim XP`,
          estimatedMinutes: Math.max(5, Math.round(dur * 0.25)),
          frictionReductionTip: 'A definitive closure ritual signals reward dopamine to your nervous system.',
        },
      ],
      temptationBundleSuggestion: 'Enjoy a warm snack or your favorite playlist victory track once the checkmark is logged.',
      proTip: 'Never miss twice: small consistent quest completions build unstoppable compounding confidence.',
    };
  }

  // 1. AI Task Sizing & Intelligent Subtask Splitting
  // Evaluates task, analyzes cognitive friction, and invents creative, bespoke micro-steps
  app.post('/api/ai/split-task', async (req, res) => {
    try {
      const { taskTitle, durationMinutes, sectionName, category, notes, creativeStyle, seed } = req.body;

      if (!taskTitle) {
        return res.status(400).json({ error: 'Task title is required' });
      }

      const styleGuide: Record<string, string> = {
        gamified: 'Epic RPG quest style: dungeons, boss battles, skill checks, loot drops, and legendary momentum.',
        speedrun: 'Anti-perfectionist speedrun blitz: maximum output, ruthless velocity, clearing obstacles at record pace.',
        deep_flow: 'Deep flow state & cognitive immersion: pristine focus, distraction barriers, deep brain wave alignment.',
        creative: 'Imaginative, witty, playful, and inventive: thinking completely outside the box with clever metaphors.',
        gentle: 'Low-drag, zero-shame, ADHD-friendly: ultra-gentle on-ramp, micro-steps that feel as effortless as breathing.',
      };

      const selectedStyleDescription = styleGuide[creativeStyle] || styleGuide.gamified;

      const prompt = `You are a world-class, hyper-creative productivity quest architect and gamification engine.
A player wants you to analyze and creatively break down their quest/task:

Task / Quest Title: "${taskTitle}"
Allocated Duration: ${durationMinutes || 60} minutes
Day Section: "${sectionName || 'General'}"
Category: "${category || 'needed'}" (needed = core high-focus quest, rewarding = dopamine/recharge buff, maintenance = chores/admin)
Additional Context: "${notes || 'None'}"
Creative Style Lens: "${creativeStyle || 'gamified'}" (${selectedStyleDescription})
Variation Seed: ${seed || Math.floor(Math.random() * 100000)}

CRITICAL CREATIVE INSTRUCTIONS (AVOID ALL ROBOTIC FORMULAS):
1. NO GENERIC OR REPETITIVE STEPS:
   - NEVER output clichés like "Prepare workspace", "Core focused execution block", "Quick recap", or "Review checkpoint".
   - Every single step title must be colorful, creative, and specifically tailored to the meaning of "${taskTitle}".
2. IF THE INPUT IS UNUSUAL, CRYPTIC, SLANG, OR ODD (e.g. "dgad", "asdf", "grind", "vibe code", "pwn", "lore"):
   - DO NOT give up or revert to a generic formula!
   - Be brilliantly witty, imaginative, and perceptive! Interpret it with creative flair (e.g. for "dgad", interpret it as a secretive rogue op "The DGAD Protocol: Decode, Galvanize, Attack, Deliver" or a humorous "Don't-Give-A-Damn Anti-Perfectionism Blitz").
3. IF THE INPUT IS REAL/NORMAL (e.g. "Study for physics exam", "Clean bedroom", "Write essay", "Fix bug in auth"):
   - Provide authentic, domain-insider tactics that make the quest fun and dynamic.
   - For studying: active-recall challenge, concept-mapping speedrun, boss-level self-quizzing.
   - For cleaning: zone clearance speedrun, sensory soundtrack pairing, inventory sort.
   - For writing/coding: skeleton prototyping, dirty draft blitz, polish pass.
4. VARIABLE STEP COUNT:
   - Provide between 2 and 5 sub-tasks depending on what naturally fits the task and duration. DO NOT always give 3 steps.
5. FRICTION TIPS:
   - Each sub-task must include a "frictionReductionTip" that is a genuine psychological or gaming lifehack (e.g. 5-second launch rule, inverted drafting, tactile countdown, binaural audio trick).
6. CREATIVE THEME:
   - Provide a catchy, cinematic, or playful "creativeTheme" title for this quest (e.g. "Operation DGAD: The Midnight Decryption", "Speedrun Bedroom Blitz: The Floor Is Lava").
7. REWARD BUFF (temptationBundleSuggestion):
   - Make it a delightfully specific, fun treat or reward paired to this quest (e.g., icy sparkling drink + 10m YouTube video, favorite game round, high-vibe stroll).

Respond with valid JSON adhering strictly to this schema:
{
  "creativeTheme": string,
  "isTooBig": boolean,
  "frictionAnalysis": string (1-2 sentences with real personality analyzing the cognitive barrier or resistance),
  "recommendedTotalMinutes": number,
  "subtasks": [
    {
      "title": string (action-packed, creative, specific to this task),
      "estimatedMinutes": number,
      "frictionReductionTip": string (clever lifehack/tip)
    }
  ],
  "temptationBundleSuggestion": string,
  "proTip": string (memorable, witty mental model or pro rule)
}`;

      const splitTaskSchema = {
        type: Type.OBJECT,
        properties: {
          creativeTheme: { type: Type.STRING },
          isTooBig: { type: Type.BOOLEAN },
          frictionAnalysis: { type: Type.STRING },
          recommendedTotalMinutes: { type: Type.NUMBER },
          subtasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                estimatedMinutes: { type: Type.NUMBER },
                frictionReductionTip: { type: Type.STRING },
              },
              required: ['title', 'estimatedMinutes', 'frictionReductionTip'],
            },
          },
          temptationBundleSuggestion: { type: Type.STRING },
          proTip: { type: Type.STRING },
        },
        required: ['creativeTheme', 'isTooBig', 'frictionAnalysis', 'subtasks', 'temptationBundleSuggestion', 'proTip'],
      };

      const parsedData = await callGemini(prompt, splitTaskSchema);
      res.json(parsedData);
    } catch (error: any) {
      console.error('Error in /api/ai/split-task after trying all models:', error);
      const fallback = generateSmartCreativeFallback(req.body.taskTitle, req.body.durationMinutes, req.body.creativeStyle);
      res.json(fallback);
    }
  });

  // 2. AI Day Balance Coach (Daily Schedule Harmony)
  // Evaluates ratio of Needed vs Rewarding vs Maintenance tasks to ensure long-term sustainability
  app.post('/api/ai/balance-coach', async (req, res) => {
    try {
      const { neededMinutes, rewardingMinutes, maintenanceMinutes, habitsCount, sectionsCount, userContext } = req.body;

      const prompt = `You are a game-level productivity coach.
Analyze the player's daily schedule composition:
- Needed/Core Work Tasks: ${neededMinutes || 0} minutes
- Rewarding/Dopamine/Rest Tasks: ${rewardingMinutes || 0} minutes
- Maintenance/Chores/Admin Tasks: ${maintenanceMinutes || 0} minutes
- Active Habits tracked: ${habitsCount || 0}
- Day Sections configured: ${sectionsCount || 3}
- User Context: ${userContext || 'Student or High-Intensity Aspirant'}

Core Principle:
People make schedules overly rigid (100% hard study/work, 0% rewards), which causes burnout and abandonment within days.
A sustainable plan balances:
1. Needed stuff (high impact)
2. Rewarding stuff (temptation bundling, guilt-free recovery, dopamine refresh)
3. Maintenance stuff (not critical but must be done, kept short and batched).

Evaluate the user's daily balance and provide constructive guidance:
- Status: "Optimal Flow" | "Too Rigid (Burnout Danger)" | "Too Slack / Drift" | "Needs Maintenance Batching"
- Sustainability Score (0 to 100)
- Actionable adjustments to make the schedule stick for months
- A short power rule for sustainable daily momentum

Respond with JSON adhering to schema.`;

      const balanceSchema = {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING },
          sustainabilityScore: { type: Type.NUMBER },
          critique: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          temptationBundleIdea: { type: Type.STRING },
          strategyRule: { type: Type.STRING },
        },
        required: ['status', 'sustainabilityScore', 'critique', 'recommendations', 'strategyRule'],
      };

      const parsedData = await callGemini(prompt, balanceSchema);
      res.json(parsedData);
    } catch (error: any) {
      console.error('Error in /api/ai/balance-coach:', error);
      const needed = Number(req.body.neededMinutes) || 0;
      const rewarding = Number(req.body.rewardingMinutes) || 0;
      const total = needed + rewarding + (Number(req.body.maintenanceMinutes) || 0);

      const ratio = total > 0 ? rewarding / total : 0.2;
      const isRigid = ratio < 0.15;

      res.json({
        status: isRigid ? 'Too Rigid (Burnout Danger)' : 'Balanced Sustainable Rhythm',
        sustainabilityScore: isRigid ? 62 : 88,
        critique: isRigid
          ? 'Your schedule is weighted heavily towards obligations with minimal planned rewards. Rigid schedules trigger subconscious resistance.'
          : 'Great job incorporating rewarding periods alongside needed obligations. This creates sustainable momentum.',
        recommendations: [
          'Schedule an intentional 20-30 min rewarding activity after your hardest needed block.',
          'Batch maintenance tasks together in one quick 30-minute block.',
          'Protect 15 minutes of evening wind-down to reflect on small wins.',
        ],
        temptationBundleIdea: 'Only play a game or watch your favorite show after finishing your top priority study sprint.',
        strategyRule: 'Consistency beats intensity. Build a game loop you look forward to waking up for.',
      });
    }
  });

  // 3. AI Diary & Daily Debrief
  app.post('/api/ai/reflect', async (req, res) => {
    try {
      const { wins, onePercentBetter, frictionEncountered, completedCount, totalCount, habitsCompleted } = req.body;

      const prompt = `You are a motivating daily debrief coach for high-performance players.
The user is logging their evening debrief:
- Wins of the Day: "${wins || 'Completed key quests'}"
- 1% Improvement for Tomorrow: "${onePercentBetter || 'Be more focused'}"
- Friction / Obstacles Faced: "${frictionEncountered || 'Distractions and fatigue'}"
- Quests Completed: ${completedCount}/${totalCount}
- Habits Checked: ${habitsCompleted || 0}

Provide an uplifting, insightful 2-sentence evening debrief.
Provide 1 concrete tweak to minimize tomorrow's friction.

Respond with JSON adhering to schema.`;

      const reflectSchema = {
        type: Type.OBJECT,
        properties: {
          coachDebrief: { type: Type.STRING },
          microUpgrade: { type: Type.STRING },
          mindsetNote: { type: Type.STRING },
        },
        required: ['coachDebrief', 'microUpgrade', 'mindsetNote'],
      };

      const parsedData = await callGemini(prompt, reflectSchema);
      res.json(parsedData);
    } catch (error: any) {
      console.error('Error in /api/ai/reflect:', error);
      res.json({
        coachDebrief: 'Solid execution today. Showing up consistently builds unbeatable momentum.',
        microUpgrade: 'Prepare your workspace tonight so starting tomorrow requires zero effort.',
        mindsetNote: 'Small consistent steps compound into massive results.',
      });
    }
  });

  // Vite middleware in dev or static serving in prod
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gamin' Life server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
