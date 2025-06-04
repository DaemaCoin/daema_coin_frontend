import { create } from 'zustand';
import { MiningState, MiningSession, Commit } from '@/types';

interface MiningStore extends MiningState {
  startMining: () => void;
  stopMining: () => void;
  addCommit: (commit: Commit) => void;
  updateSession: (session: MiningSession) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCommits: () => void;
}

export const useMiningStore = create<MiningStore>((set, get) => ({
  isActive: false,
  currentSession: null,
  recentCommits: [],
  totalEarned: 0,
  isLoading: false,
  error: null,

  startMining: () => {
    const now = new Date().toISOString();
    const newSession: MiningSession = {
      id: `session_${Date.now()}`,
      userId: 'current_user', // 실제로는 auth store에서 가져와야 함
      startTime: now,
      totalCoins: 0,
      commitsProcessed: 0,
      isActive: true
    };

    set({
      isActive: true,
      currentSession: newSession,
      error: null
    });
  },

  stopMining: () => {
    const currentSession = get().currentSession;
    if (currentSession) {
      const updatedSession: MiningSession = {
        ...currentSession,
        endTime: new Date().toISOString(),
        isActive: false
      };

      set({
        isActive: false,
        currentSession: updatedSession
      });
    }
  },

  addCommit: (commit: Commit) => {
    const { recentCommits, totalEarned, currentSession } = get();
    const newCommits = [commit, ...recentCommits].slice(0, 50); // 최근 50개만 유지
    const newTotalEarned = totalEarned + commit.coinsEarned;

    let updatedSession = currentSession;
    if (currentSession && currentSession.isActive) {
      updatedSession = {
        ...currentSession,
        totalCoins: currentSession.totalCoins + commit.coinsEarned,
        commitsProcessed: currentSession.commitsProcessed + 1
      };
    }

    set({
      recentCommits: newCommits,
      totalEarned: newTotalEarned,
      currentSession: updatedSession
    });
  },

  updateSession: (session: MiningSession) => {
    set({ currentSession: session });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error, isLoading: false });
  },

  clearCommits: () => {
    set({ recentCommits: [] });
  }
})); 