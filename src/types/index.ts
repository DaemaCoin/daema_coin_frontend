export interface User {
  id: string;
  xquareId: string;
  githubId: string;
  githubUsername: string;
  avatar: string;
  name: string;
  email: string;
  totalCoins: number;
  createdAt: string;
  lastMiningAt?: string;
}

export interface Commit {
  id: string;
  sha: string;
  message: string;
  author: string;
  date: string;
  repository: string;
  coinsEarned: number;
  isMined: boolean;
  additions: number;
  deletions: number;
  changedFiles: number;
}

export interface MiningSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  totalCoins: number;
  commitsProcessed: number;
  isActive: boolean;
}

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  private: boolean;
  language: string;
  stars: number;
  lastCommitAt: string;
  isEnabled: boolean;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  type: 'mining' | 'bonus' | 'penalty';
  amount: number;
  description: string;
  commitId?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  xquareId: string | null;
  githubInfo: null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface MiningState {
  isActive: boolean;
  currentSession: MiningSession | null;
  recentCommits: Commit[];
  totalEarned: number;
  isLoading: boolean;
  error: string | null;
}

export interface WalletInfo {
  owner: string;
  balance: number;
}

export interface XquareLoginResponse {
  xquareId: string;
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  githubId?: string;
  githubUsername?: string;
  avatar?: string;
  name?: string;
  email?: string;
  totalCoins?: number;
  createdAt?: string;
  lastMiningAt?: string;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  userId?: string;
  githubId?: string;
  githubUsername?: string;
  avatar?: string;
  name?: string;
  email?: string;
  totalCoins?: number;
  createdAt?: string;
  lastMiningAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface XquareLoginForm {
  accountId: string;
  password: string;
}

export interface UserProfile {
  id: string;
  githubId: string;
  githubImageUrl: string;
  totalCommits: number;
}

export interface LeaderboardEntry {
  rank: number;
  profileImageUrl: string;
  totalCoins: number;
  githubId: string;
}

export interface LeaderboardResponse {
  items: LeaderboardEntry[];
  currentPage: number;
  pageSize: number;
  totalUsers: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface WalletHistoryResponse {
  history: any[];
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
} 