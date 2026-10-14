import { UserProfile, Task, Habit, DailyDiaryEntry, NotificationItem, UserAccountData } from '../types';
import { getActiveAccount, setActiveAccount } from './storage';

export type SyncStatus = 'idle' | 'syncing' | 'saved' | 'error';

class SyncService {
  private syncTimeout: any = null;
  private statusListeners: ((status: SyncStatus, lastSaved?: string) => void)[] = [];
  private currentStatus: SyncStatus = 'idle';
  private lastSavedTime: string | null = null;

  public subscribeStatus(listener: (status: SyncStatus, lastSaved?: string) => void) {
    this.statusListeners.push(listener);
    listener(this.currentStatus, this.lastSavedTime || undefined);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  private setStatus(status: SyncStatus, lastSaved?: string) {
    this.currentStatus = status;
    if (lastSaved) this.lastSavedTime = lastSaved;
    this.statusListeners.forEach((l) => l(status, this.lastSavedTime || undefined));
  }

  // Fetch account data from the server
  public async fetchServerData(account?: string): Promise<UserAccountData | null> {
    const acc = (account || getActiveAccount() || 'default').toLowerCase().trim();
    try {
      this.setStatus('syncing');
      const res = await fetch(`/api/user/sync?account=${encodeURIComponent(acc)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.exists && json.data) {
        this.setStatus('saved', json.data.updatedAt);
        return json.data as UserAccountData;
      }
      this.setStatus('idle');
      return null;
    } catch (err) {
      console.warn('[SyncService] Could not fetch server data:', err);
      this.setStatus('error');
      return null;
    }
  }

  // Debounced auto-save to server
  public queueCloudSync(data: {
    account?: string;
    profile: UserProfile;
    tasks: Task[];
    habits: Habit[];
    diaryEntries: Record<string, DailyDiaryEntry>;
    notifications: NotificationItem[];
    xpPoints: number;
  }) {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    this.setStatus('syncing');
    this.syncTimeout = setTimeout(async () => {
      await this.saveImmediately(data);
    }, 800);
  }

  // Save immediately to server
  public async saveImmediately(data: {
    account?: string;
    profile: UserProfile;
    tasks: Task[];
    habits: Habit[];
    diaryEntries: Record<string, DailyDiaryEntry>;
    notifications: NotificationItem[];
    xpPoints: number;
  }): Promise<boolean> {
    const acc = (data.account || data.profile.email || getActiveAccount() || 'default').toLowerCase().trim();
    try {
      this.setStatus('syncing');
      const res = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: acc,
          profile: data.profile,
          tasks: data.tasks,
          habits: data.habits,
          diaryEntries: data.diaryEntries,
          notifications: data.notifications,
          xpPoints: data.xpPoints,
        }),
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();
      if (json.success) {
        this.setStatus('saved', json.savedAt);
        setActiveAccount(acc);
        return true;
      }
      this.setStatus('error');
      return false;
    } catch (err) {
      console.warn('[SyncService] Cloud save failed, changes preserved locally:', err);
      this.setStatus('error');
      return false;
    }
  }

  // Login / link with Google or Browser account
  public async loginWithAccount(credentials: {
    credential?: string;
    email?: string;
    name?: string;
    picture?: string;
  }): Promise<UserAccountData | null> {
    try {
      this.setStatus('syncing');
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) throw new Error(`Auth failed with status ${res.status}`);
      const json = await res.json();
      if (json.success && json.user) {
        const userData = json.user as UserAccountData;
        setActiveAccount(userData.account);
        this.setStatus('saved', userData.updatedAt);
        return userData;
      }
      this.setStatus('error');
      return null;
    } catch (err) {
      console.error('[SyncService] Login error:', err);
      this.setStatus('error');
      return null;
    }
  }

  // List accounts saved on server
  public async listAccounts(): Promise<any[]> {
    try {
      const res = await fetch('/api/user/accounts');
      if (!res.ok) return [];
      const json = await res.json();
      return json.accounts || [];
    } catch {
      return [];
    }
  }
}

export const syncService = new SyncService();
