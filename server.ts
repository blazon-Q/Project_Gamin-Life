import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
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
  function generateSmartCreativeFallback(taskTitle: string, durationMinutes: number, style?: string, stepPref?: string) {
    const title = (taskTitle || 'Task').trim();
    const dur = Number(durationMinutes) || 45;
    const isShortOrCryptic = /^[a-zA-Z0-9_\-]{2,7}$/.test(title);
    const wantMoreSteps = stepPref === '6-8';

    if (isShortOrCryptic) {
      const subtasks = wantMoreSteps
        ? [
            {
              title: `Step 1: Write down what "${title}" means in 2 minutes`,
              estimatedMinutes: Math.max(3, Math.round(dur * 0.1)),
              frictionReductionTip: 'Just write a quick sentence about what you want done.',
            },
            {
              title: 'Step 2: Clear your desk and get your tools ready',
              estimatedMinutes: Math.max(3, Math.round(dur * 0.1)),
              frictionReductionTip: 'Close extra tabs and put your phone on silent.',
            },
            {
              title: 'Step 3: Do the easiest first part to get started',
              estimatedMinutes: Math.max(5, Math.round(dur * 0.2)),
              frictionReductionTip: 'Tell yourself you only need to work for 5 minutes.',
            },
            {
              title: 'Step 4: Work on the main part without checking messages',
              estimatedMinutes: Math.max(5, Math.round(dur * 0.25)),
              frictionReductionTip: 'Stay focused on one thing at a time.',
            },
            {
              title: 'Step 5: Take a quick 2-minute stretch or water break',
              estimatedMinutes: Math.max(2, Math.round(dur * 0.1)),
              frictionReductionTip: 'Stand up, roll your shoulders, and drink water.',
            },
            {
              title: 'Step 6: Finish up the final details',
              estimatedMinutes: Math.max(5, Math.round(dur * 0.15)),
              frictionReductionTip: 'Do not worry about perfection, just get it done.',
            },
            {
              title: 'Step 7: Review your work and check it off',
              estimatedMinutes: Math.max(3, Math.round(dur * 0.1)),
              frictionReductionTip: 'Give yourself credit for finishing this task!',
            },
          ]
        : [
            {
              title: `Step 1: Write down what "${title}" means in 2 minutes`,
              estimatedMinutes: Math.max(3, Math.round(dur * 0.1)),
              frictionReductionTip: 'Just write a quick note on what you want to achieve.',
            },
            {
              title: 'Step 2: Clear your desk and open what you need',
              estimatedMinutes: Math.max(3, Math.round(dur * 0.15)),
              frictionReductionTip: 'Put your phone face down in another spot.',
            },
            {
              title: 'Step 3: Start on the first simple part',
              estimatedMinutes: Math.max(5, Math.round(dur * 0.35)),
              frictionReductionTip: 'Starting is the hardest part. Just begin for 5 minutes!',
            },
            {
              title: 'Step 4: Continue and complete the main work',
              estimatedMinutes: Math.max(5, Math.round(dur * 0.25)),
              frictionReductionTip: 'Focus on one step at a time without multitasking.',
            },
            {
              title: 'Step 5: Quick review and mark it complete',
              estimatedMinutes: Math.max(3, Math.round(dur * 0.15)),
              frictionReductionTip: 'Celebrate finishing this step!',
            },
          ];

      return {
        creativeTheme: `Simple Plan for "${title}"`,
        isTooBig: dur > 50,
        frictionAnalysis: `This task feels unclear or overwhelming. Breaking it into small, simple steps makes it easy to begin right away.`,
        recommendedTotalMinutes: dur,
        subtasks,
        temptationBundleSuggestion: 'Enjoy a cold drink or watch a quick 10-minute video when you finish.',
        proTip: 'Starting is the hardest part. Once you take the first step, everything gets easier!',
      };
    }

    const subtasks = wantMoreSteps
      ? [
          {
            title: `Step 1: Set up your materials for "${title}"`,
            estimatedMinutes: Math.max(3, Math.round(dur * 0.1)),
            frictionReductionTip: 'Get everything in front of you so you do not have to look for things later.',
          },
          {
            title: 'Step 2: Knock out the easiest quick piece',
            estimatedMinutes: Math.max(5, Math.round(dur * 0.15)),
            frictionReductionTip: 'Picking an easy win first gives you immediate momentum.',
          },
          {
            title: 'Step 3: Tackle the core part in single-task focus',
            estimatedMinutes: Math.max(5, Math.round(dur * 0.25)),
            frictionReductionTip: 'Put your phone on silent and work on this one thing.',
          },
          {
            title: 'Step 4: Take a 2-minute breather and drink water',
            estimatedMinutes: Math.max(2, Math.round(dur * 0.1)),
            frictionReductionTip: 'Stand up, stretch your arms, and breathe.',
          },
          {
            title: 'Step 5: Continue with the second part of the task',
            estimatedMinutes: Math.max(5, Math.round(dur * 0.2)),
            frictionReductionTip: 'You are almost there—keep the rhythm going.',
          },
          {
            title: 'Step 6: Review what you did and polish up',
            estimatedMinutes: Math.max(3, Math.round(dur * 0.1)),
            frictionReductionTip: 'Check your work and save your progress.',
          },
          {
            title: 'Step 7: Check off the task and take a well-earned break',
            estimatedMinutes: Math.max(2, Math.round(dur * 0.1)),
            frictionReductionTip: 'Give yourself a thumbs up for completing it!',
          },
        ]
      : [
          {
            title: `Step 1: Set up your workspace and materials for "${title}"`,
            estimatedMinutes: Math.max(3, Math.round(dur * 0.1)),
            frictionReductionTip: 'Take 2 minutes to get ready so you have zero distractions.',
          },
          {
            title: 'Step 2: Do the first small piece to get started',
            estimatedMinutes: Math.max(5, Math.round(dur * 0.25)),
            frictionReductionTip: 'Start with the simplest part first so you feel fast progress.',
          },
          {
            title: 'Step 3: Work on the main part without interruptions',
            estimatedMinutes: Math.max(5, Math.round(dur * 0.35)),
            frictionReductionTip: 'Put your phone in another room or turn on Do Not Disturb.',
          },
          {
            title: 'Step 4: Take a quick 2-minute stretch or breather',
            estimatedMinutes: Math.max(2, Math.round(dur * 0.1)),
            frictionReductionTip: 'Stand up and take a deep breath before finishing up.',
          },
          {
            title: 'Step 5: Review your work and check off the task',
            estimatedMinutes: Math.max(3, Math.round(dur * 0.2)),
            frictionReductionTip: 'Give yourself credit for finishing what you started!',
          },
        ];

    return {
      creativeTheme: `Simple Plan: Getting "${title}" Done`,
      isTooBig: dur > 50,
      frictionAnalysis: `Big tasks can feel heavy when you try to do them all at once. Small steps make it feel light and easy.`,
      recommendedTotalMinutes: dur,
      subtasks,
      temptationBundleSuggestion: 'Treat yourself to a snack or 15 minutes of your favorite hobby right after.',
      proTip: 'Doing a little bit every day always beats trying to do everything at once.',
    };
  }

  // 1. AI Task Sizing & Intelligent Subtask Splitting
  // Evaluates task and breaks it down into simple, easy-to-understand steps (always more than 3 steps)
  app.post('/api/ai/split-task', async (req, res) => {
    try {
      const { taskTitle, durationMinutes, sectionName, category, notes, creativeStyle, stepCountPreference, seed } = req.body;

      if (!taskTitle) {
        return res.status(400).json({ error: 'Task title is required' });
      }

      const styleGuide: Record<string, string> = {
        gamified: 'Fun game style: clear quest steps, leveling up, and celebrating small wins.',
        speedrun: 'Quick & fast style: focused on finishing quickly without overthinking.',
        deep_flow: 'Deep focus style: calm, quiet, and distraction-free work.',
        creative: 'Creative & fun style: playful, lighthearted, and interesting steps.',
        gentle: 'Super easy style: tiny, low-stress baby steps that feel effortless.',
      };

      const selectedStyleDescription = styleGuide[creativeStyle] || styleGuide.gamified;
      const wantDetailed = stepCountPreference === '6-8';
      const stepTargetText = wantDetailed
        ? 'Break this task down into 6 to 8 clear, bite-sized steps.'
        : 'Break this task down into 4 to 6 clear, bite-sized steps (ALWAYS MORE THAN 3 STEPS).';

      const prompt = `You are a friendly, helpful task coach.
A person needs your help breaking down their task into easy, manageable steps:

Task: "${taskTitle}"
Total Time: ${durationMinutes || 45} minutes
Day Section: "${sectionName || 'General'}"
Category: "${category || 'needed'}"
Additional Context: "${notes || 'None'}"
Style Preference: "${creativeStyle || 'gamified'}" (${selectedStyleDescription})
Variation Seed: ${seed || Math.floor(Math.random() * 100000)}

CRITICAL RULES:
1. USE VERY SIMPLE AND UNDERSTANDABLE LANGUAGE:
   - Use plain, everyday English that anyone (students, workers, beginners) can easily read and understand.
   - DO NOT use confusing words, academic phrases, or psychological jargon (do NOT use words like "cognitive load", "initiation friction", "tactical decryption", "kinetic blitz", "dopamine anchor", "heaviest piece").
   - Keep step titles clear, active, and practical (e.g. "Step 1: Set up what you need", "Step 2: Read through the notes", "Step 3: Work on the first section", "Step 4: Take a 2-minute break", "Step 5: Review and finish up").
2. ALWAYS PROVIDE MORE THAN 3 STEPS:
   - ${stepTargetText}
   - NEVER output only 2 or 3 steps. Tasks feel much easier when divided into at least 4, 5, 6, or 7 small, bite-sized steps.
   - Distribute the minutes among the steps so their sum is close to ${durationMinutes || 45} minutes.
3. FOR UNUSUAL OR SHORT NAMES (e.g. "dgad", "asdf", "grind", "chores"):
   - Be friendly and creative! Give it a fun, clear title like "Plan for ${taskTitle}" and make 4 to 6 logical steps (clarify the goal, get set up, do the first part, do the second part, take a breather, finish up).
4. SIMPLE, PRACTICAL TIPS:
   - For every step, provide a "frictionReductionTip" that is a simple, practical tip anyone can do (e.g. "Put your phone in another room", "Set a 5-minute timer just to start", "Drink a glass of water first").
5. SIMPLE REWARD (temptationBundleSuggestion):
   - Suggest a fun, simple treat to enjoy right after finishing (e.g. "Enjoy a cold drink or watch a quick funny video", "Play a round of your favorite game", "Take a short walk outside").
6. SIMPLE PRO TIP (proTip):
   - 1 encouraging, easy-to-remember sentence (e.g. "Starting is the hardest part. Once you take the first step, momentum takes over!").

Respond with valid JSON adhering strictly to this schema:
{
  "creativeTheme": string (a simple, friendly name for this plan),
  "isTooBig": boolean,
  "frictionAnalysis": string (1-2 simple sentences explaining why this task might feel hard and how small steps help),
  "recommendedTotalMinutes": number,
  "subtasks": [
    {
      "title": string (simple, clear step title),
      "estimatedMinutes": number,
      "frictionReductionTip": string (simple helpful tip)
    }
  ],
  "temptationBundleSuggestion": string (simple treat or reward),
  "proTip": string (simple encouraging advice)
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
      const fallback = generateSmartCreativeFallback(req.body.taskTitle, req.body.durationMinutes, req.body.creativeStyle, req.body.stepCountPreference);
      res.json(fallback);
    }
  });

  // 2. AI Day Balance Coach (Daily Schedule Harmony)
  // Evaluates ratio of Needed vs Rewarding vs Maintenance tasks to ensure long-term sustainability
  app.post('/api/ai/balance-coach', async (req, res) => {
    try {
      const { neededMinutes, rewardingMinutes, maintenanceMinutes, habitsCount, sectionsCount, userContext } = req.body;

      const prompt = `You are a friendly, encouraging daily routine coach.
Analyze the person's daily schedule:
- Work/Study Tasks: ${neededMinutes || 0} minutes
- Rest/Fun/Reward Tasks: ${rewardingMinutes || 0} minutes
- Chores/Admin Tasks: ${maintenanceMinutes || 0} minutes
- Daily Habits tracked: ${habitsCount || 0}
- Day Sections: ${sectionsCount || 3}

Core Principle:
Use simple, clear, everyday words. When people schedule only work and zero rest, they burn out quickly.
A healthy day includes work, enjoyable rest, and quick chores.

Evaluate their daily balance in simple, easy-to-understand language:
- Status: "Good Balance" | "Too Much Work (Needs Rest)" | "A Bit Too Relaxed" | "Need to Organize Chores"
- Sustainability Score (0 to 100)
- critique: 2 simple sentences in plain English about how their day looks.
- recommendations: 3 simple, practical tips to make their day easier and more enjoyable.
- temptationBundleIdea: 1 fun reward to look forward to after finishing hard tasks.
- strategyRule: 1 short, memorable rule (e.g. "Take regular short breaks so you stay fresh and energized!").

Respond with valid JSON.`;

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
        status: isRigid ? 'Too Much Work (Needs Rest)' : 'Good Balance',
        sustainabilityScore: isRigid ? 65 : 88,
        critique: isRigid
          ? 'Your day has a lot of work and very little scheduled rest. Taking short breaks will help you stay energized and prevent burnout.'
          : 'Great job! You have a nice mix of work and fun activities planned for today.',
        recommendations: [
          'Take a relaxing 15-20 minute break after your biggest study or work session.',
          'Get quick chores done in one fast 20-minute block.',
          'Take 10 minutes in the evening to relax and celebrate your progress.',
        ],
        temptationBundleIdea: 'Save your favorite game or show to enjoy right after you finish your main task.',
        strategyRule: 'Steady progress every day beats burning yourself out in one afternoon.',
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
  const hasDist = fs.existsSync(path.join(__dirname, 'dist', 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RAILWAY_ENVIRONMENT || !!process.env.RENDER || hasDist;

  if (isProduction && hasDist) {
    console.log(`[Production] Serving static files from ${path.join(__dirname, 'dist')}`);
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    console.log('[Development] Initializing Vite middleware');
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
