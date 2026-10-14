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

  // 1. AI Task Sizing & Intelligent Subtask Splitting
  // Evaluates if the task is too big for the allotted time, identifies cognitive friction,
  // and breaks it down into low-friction micro sub-tasks with an immediate reward incentive.
  app.post('/api/ai/split-task', async (req, res) => {
    try {
      const { taskTitle, durationMinutes, sectionName, category, notes } = req.body;

      if (!taskTitle) {
        return res.status(400).json({ error: 'Task title is required' });
      }

      const prompt = `You are an elite productivity game-master and daily quest architect.
A player is scheduling a quest / task:
- Task: "${taskTitle}"
- Allocated Duration: ${durationMinutes || 60} minutes
- Day Section: "${sectionName || 'General'}"
- Category: "${category || 'needed'}" (needed = core high-focus quest, rewarding = dopamine/recharge buff, maintenance = chores/admin)
- Additional Notes: "${notes || 'None'}"

Evaluate this quest:
1. Is this task too big, vague, or cognitively overwhelming to be executed in one sitting without procrastination or drop-off?
   - Tasks like "Study physics for 3 hours", "Write thesis", "Build website", "Clean entire house", "Work out hard" have high initiation friction and often lead to avoidance.
   - If estimated time is > 45 minutes or if the task has multiple implicit steps, it is usually "too big" and should be broken down.
2. If it is too big (or even if moderate), suggest 2 to 4 smaller, manageable sub-tasks.
   - Include a 2-minute micro starter to eliminate startup inertia (e.g. "Open notebook and write formula index heading").
   - Follow with focused execution blocks (e.g. 25-30m each).
   - Suggest a satisfying checkpoint.
3. Suggest a "Reward Buff" or temptation bundle (an immediate enjoyable reward or treat) to pair with or follow this quest.

Respond with JSON adhering to this schema:
{
  "isTooBig": boolean,
  "frictionAnalysis": string (1-2 sentences on why this might trigger avoidance or fatigue),
  "recommendedTotalMinutes": number,
  "subtasks": [
    {
      "title": string (action-oriented micro-task),
      "estimatedMinutes": number,
      "frictionReductionTip": string
    }
  ],
  "temptationBundleSuggestion": string,
  "proTip": string
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
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
                  required: ['title', 'estimatedMinutes'],
                },
              },
              temptationBundleSuggestion: { type: Type.STRING },
              proTip: { type: Type.STRING },
            },
            required: ['isTooBig', 'frictionAnalysis', 'subtasks', 'temptationBundleSuggestion'],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from AI model');
      }

      const parsedData = JSON.parse(responseText);
      res.json(parsedData);
    } catch (error: any) {
      console.error('Error in /api/ai/split-task:', error);
      const duration = Number(req.body.durationMinutes) || 45;
      res.json({
        isTooBig: duration > 50,
        frictionAnalysis: 'Breaking large intentions into clear physical actions reduces initiation friction.',
        recommendedTotalMinutes: duration,
        subtasks: [
          {
            title: `Prepare workspace and outline 1st step for "${req.body.taskTitle || 'Task'}"`,
            estimatedMinutes: Math.min(5, Math.round(duration * 0.1)),
            frictionReductionTip: '2-Minute Starter: Lower the barrier to start.',
          },
          {
            title: `Core focused execution block`,
            estimatedMinutes: Math.round(duration * 0.7),
            frictionReductionTip: 'Single-tasking deep work without distractions.',
          },
          {
            title: `Quick recap and checkpoint`,
            estimatedMinutes: Math.max(5, Math.round(duration * 0.2)),
            frictionReductionTip: 'Clear completion milestone.',
          },
        ],
        temptationBundleSuggestion: 'Take a 10-minute guilt-free break with your favorite refreshment right after.',
        proTip: 'Never miss twice: small consistent steps compound exponentially.',
      });
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

Respond with JSON adhering to:
{
  "status": string,
  "sustainabilityScore": number,
  "critique": string (2-3 sentences),
  "recommendations": string[],
  "temptationBundleIdea": string,
  "strategyRule": string
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
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
          },
        },
      });

      const responseText = response.text;
      if (!responseText) throw new Error('Empty AI response');
      res.json(JSON.parse(responseText));
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

Respond with JSON adhering to:
{
  "coachDebrief": string,
  "microUpgrade": string,
  "mindsetNote": string
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coachDebrief: { type: Type.STRING },
              microUpgrade: { type: Type.STRING },
              mindsetNote: { type: Type.STRING },
            },
            required: ['coachDebrief', 'microUpgrade', 'mindsetNote'],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) throw new Error('Empty AI response');
      res.json(JSON.parse(responseText));
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
