import { create } from 'zustand';
import { Commit } from '@/types';

interface MiningStore {
  recentCommits: Commit[];
  totalEarned: number;
  isLoading: boolean;
  error: string | null;
  
  addCommit: (commit: Commit) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCommits: () => void;
}

export const useMiningStore = create<MiningStore>((set, get) => ({
  recentCommits: [],
  totalEarned: 0,
  isLoading: false,
  error: null,

  addCommit: (commit: Commit) => {
    const { recentCommits, totalEarned } = get();
    const newCommits = [commit, ...recentCommits].slice(0, 50); // 최근 50개만 유지
    const newTotalEarned = totalEarned + commit.coinsEarned;

    set({
      recentCommits: newCommits,
      totalEarned: newTotalEarned
    });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error, isLoading: false });
  },

  clearCommits: () => {
    set({ recentCommits: [], totalEarned: 0 });
  }
})); 