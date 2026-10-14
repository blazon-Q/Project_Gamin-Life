import { NotificationItem, Task, DaySection, Habit } from '../types';
import { playReminderChime } from './audio';

// Helper to check and request browser notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.warn('Error requesting notification permission:', e);
    return 'default';
  }
}

export function hasNotificationPermission(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

// Trigger a timely notification (both system + sound + callback for in-app state)
export function dispatchNotification(
  title: string,
  message: string,
  type: NotificationItem['type'] = 'task',
  onNewNotification?: (item: NotificationItem) => void
): NotificationItem {
  playReminderChime();

  const item: NotificationItem = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title,
    message,
    type,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
  };

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }

  if (onNewNotification) {
    onNewNotification(item);
  }

  return item;
}

// Parse "HH:MM" into minutes from midnight
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Current minutes from midnight
export function getCurrentTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

// Check schedule commitments against current time
export function checkUpcomingReminders(
  tasks: Task[],
  habits: Habit[],
  notifiedIds: Set<string>,
  onNotify: (item: NotificationItem, idKey: string) => void,
  sections?: DaySection[]
) {
  const currentMinutes = getCurrentTimeMinutes();
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Check Section transitions if sections are present
  if (sections && sections.length > 0) {
    sections.forEach((sec) => {
      const secStartMin = timeToMinutes(sec.startTime);
      const diff = secStartMin - currentMinutes;
      const notifKey = `sec_${sec.id}_${todayStr}_${sec.startTime}`;

      if (diff >= 0 && diff <= 5 && !notifiedIds.has(notifKey)) {
        const msg = diff === 0
          ? `Your "${sec.title}" block is starting now (${sec.startTime} - ${sec.endTime}).`
          : `"${sec.title}" begins in ${diff} minute${diff > 1 ? 's' : ''}.`;

        const notif = dispatchNotification(`⚡ Schedule Alert: ${sec.title}`, msg, 'section');
        onNotify(notif, notifKey);
      }
    });
  }

  // 2. Check Tasks scheduled with explicit time
  tasks.forEach((task) => {
    if (task.isCompleted || !task.scheduledTime) return;
    const taskMin = timeToMinutes(task.scheduledTime);
    const reminderLead = task.reminderMinutesBefore ?? 5;
    const diff = taskMin - currentMinutes;
    const notifKey = `task_${task.id}_${todayStr}`;

    if (diff >= 0 && diff <= reminderLead && !notifiedIds.has(notifKey)) {
      const rewardNote = task.temptationBundle ? ` (Reward: ${task.temptationBundle})` : '';
      const msg = diff === 0
        ? `Time for: "${task.title}" (${task.estimatedMinutes}m)${rewardNote}`
        : `Coming up in ${diff}m: "${task.title}". Remember: 2-minute starter rule to avoid resistance!`;

      const notif = dispatchNotification(`📌 Task Reminder: ${task.title}`, msg, 'task');
      onNotify(notif, notifKey);
    }
  });

  // 3. Check Must-do Habits with reminder times
  habits.forEach((habit) => {
    if (!habit.reminderTime) return;
    const isDoneToday = Boolean(habit.completions[todayStr]);
    if (isDoneToday) return;

    const habitMin = timeToMinutes(habit.reminderTime);
    const diff = habitMin - currentMinutes;
    const notifKey = `habit_${habit.id}_${todayStr}`;

    if (diff >= 0 && diff <= 3 && !notifiedIds.has(notifKey)) {
      const stackNote = habit.habitStack ? ` (${habit.habitStack})` : '';
      const msg = `Daily commitment: "${habit.title}"${stackNote}. Keep your streak alive!`;

      const notif = dispatchNotification(`🎯 Habit Commitment: ${habit.title}`, msg, 'habit');
      onNotify(notif, notifKey);
    }
  });
}
