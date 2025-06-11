import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, User, XquareLoginForm, WalletInfo, UserProfile } from '@/types';
import { 
  xquareLogin, 
  register, 
  saveTokens, 
  clearTokens, 
  saveTemporaryXquareId,
  getTemporaryXquareId,
  clearTemporaryXquareId,
  getWalletInfo,
  getUserInfo,
  getWalletHistory
} from '@/lib/api';

// WalletHistoryItem 타입 정의
export interface WalletHistoryItem {
  id: string;
  amount: number;
  message: string;
  repoName: string;
  createdAt: string;
}

interface AuthStore extends AuthState {
  // 지갑 정보
  walletInfo: WalletInfo | null;
  walletPollingInterval: NodeJS.Timeout | null;
  
  // 사용자 프로필 정보
  userProfile: UserProfile | null;
  
  // 로그인 액션들
  loginWithXquare: (formData: XquareLoginForm) => Promise<boolean>;
  registerWithGithub: (githubCode: string) => Promise<boolean>;
  logout: () => void;
  
  // 상태 관리
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // 사용자 정보 업데이트
  updateUser: (updates: Partial<User>) => void;
  
  // 토큰 관리
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  
  // 지갑 정보 관리
  fetchWalletInfo: () => Promise<void>;
  updateWalletBalance: (balance: number) => void;
  startWalletPolling: () => void;
  stopWalletPolling: () => void;
  
  // 사용자 프로필 관리
  fetchUserProfile: () => Promise<void>;
  
  // 최근 커밋 내역(지갑 history)
  history: WalletHistoryItem[];
  fetchWalletHistory: (page?: number) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      xquareId: null,
      githubInfo: null,
      accessToken: null,
      refreshToken: null,
      walletInfo: null,
      walletPollingInterval: null,
      userProfile: null,

      // XQUARE 로그인
      loginWithXquare: async (formData: XquareLoginForm) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await xquareLogin(formData.accountId, formData.password);
          
          if (result.success && result.data) {
            // 이미 회원가입된 사용자인 경우 (accessToken과 refreshToken이 있는 경우)
            if (result.data.accessToken && result.data.refreshToken) {
              console.log('이미 회원가입된 사용자 - 바로 로그인 처리');
              
              // 토큰 저장
              saveTokens(result.data.accessToken, result.data.refreshToken);
              
              // 사용자 정보 생성 (백엔드에서 제공하는 데이터 사용)
              const user: User = {
                id: result.data.userId || 'user_' + Date.now(),
                xquareId: result.data.xquareId || formData.accountId,
                githubId: result.data.githubId || result.data.githubUsername || '',
                githubUsername: result.data.githubUsername || '',
                avatar: result.data.avatar || '/default-avatar.png',
                name: result.data.name || result.data.githubUsername || formData.accountId,
                email: result.data.email || `${result.data.githubUsername || formData.accountId}@github.local`,
                totalCoins: result.data.totalCoins || 0,
                createdAt: result.data.createdAt || new Date().toISOString(),
                lastMiningAt: result.data.lastMiningAt
              };

              set({ 
                user,
                isAuthenticated: true,
                accessToken: result.data.accessToken,
                refreshToken: result.data.refreshToken,
                xquareId: result.data.xquareId || formData.accountId,
                isLoading: false 
              });
              
              // 지갑 정보 조회
              get().fetchWalletInfo();
              
              // 사용자 프로필 정보 조회
              get().fetchUserProfile();
              
              // 지갑 정보 자동 폴링 시작
              get().startWalletPolling();
              
              return true;
            } else {
              // 신규 사용자인 경우 (xquareId만 있는 경우) - 기존 로직
              console.log('신규 사용자 - GitHub 로그인으로 진행');
              
            // xquareId를 세션 스토리지에 임시 저장
            saveTemporaryXquareId(result.data.xquareId);
            
            set({ 
              xquareId: result.data.xquareId,
              isLoading: false 
            });
            return true;
            }
          } else {
            set({ 
              error: result.error || 'XQUARE 로그인에 실패했습니다.',
              isLoading: false 
            });
            return false;
          }
        } catch (error: unknown) {
          set({ 
            error: error instanceof Error ? error.message : 'XQUARE 로그인 중 오류가 발생했습니다.',
            isLoading: false 
          });
          return false;
        }
      },

      // GitHub code로 회원가입 완료
      registerWithGithub: async (githubCode: string) => {
        set({ isLoading: true, error: null });
        
        // 임시 저장된 xquareId 가져오기
        const xquareId = getTemporaryXquareId() || get().xquareId;
        
        if (!xquareId) {
          set({ 
            error: 'XQUARE 로그인 정보가 없습니다. 다시 로그인해주세요.',
            isLoading: false 
          });
          return false;
        }

        try {
          // xquareId + GitHub code로 회원가입 진행
          console.log('회원가입 진행 중...', { xquareId, code: githubCode });
          const registerResult = await register(xquareId, githubCode);
          
          if (registerResult.success && registerResult.data) {
            // 토큰 저장
            saveTokens(registerResult.data.accessToken, registerResult.data.refreshToken);
            
            // 임시 xquareId 정리
            clearTemporaryXquareId();
            
            // 사용자 정보 생성 (백엔드에서 제공하는 데이터 사용)
            const user: User = {
              id: registerResult.data.userId || 'user_' + Date.now(),
              xquareId,
              githubId: registerResult.data.githubId || registerResult.data.githubUsername,
              githubUsername: registerResult.data.githubUsername,
              avatar: registerResult.data.avatar || '/default-avatar.png',
              name: registerResult.data.name || registerResult.data.githubUsername,
              email: registerResult.data.email || `${registerResult.data.githubUsername}@github.local`,
              totalCoins: registerResult.data.totalCoins || 200, // 시작 보너스
              createdAt: registerResult.data.createdAt || new Date().toISOString(),
              lastMiningAt: registerResult.data.lastMiningAt
            };

            set({ 
              user,
              isAuthenticated: true,
              accessToken: registerResult.data.accessToken,
              refreshToken: registerResult.data.refreshToken,
              isLoading: false 
            });
            
            // 지갑 정보 조회
            get().fetchWalletInfo();
            
            // 사용자 프로필 정보 조회
            get().fetchUserProfile();
            
            // 지갑 정보 자동 폴링 시작
            get().startWalletPolling();
            
            return true;
          } else {
            set({ 
              error: registerResult.error || '회원가입에 실패했습니다.',
              isLoading: false 
            });
            return false;
          }
        } catch (error: unknown) {
          console.error('회원가입 처리 중 오류:', error);
          set({ 
            error: error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.',
            isLoading: false 
          });
          return false;
        }
      },

      // 로그아웃
      logout: () => {
        // 지갑 폴링 중지
        get().stopWalletPolling();
        
        clearTokens();
        clearTemporaryXquareId();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          xquareId: null,
          githubInfo: null,
          accessToken: null,
          refreshToken: null,
          walletInfo: null,
          walletPollingInterval: null,
          userProfile: null
        });
      },

      // 상태 관리
      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },

      // 사용자 정보 업데이트
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates }
          });
        }
      },

      // 토큰 관리
      setTokens: (accessToken: string, refreshToken: string) => {
        saveTokens(accessToken, refreshToken);
        set({ accessToken, refreshToken });
      },

      clearAuth: () => {
        // 지갑 폴링 중지
        get().stopWalletPolling();
        
        clearTokens();
        clearTemporaryXquareId();
        set({
          user: null,
          isAuthenticated: false,
          xquareId: null,
          githubInfo: null,
          accessToken: null,
          refreshToken: null,
          walletInfo: null,
          walletPollingInterval: null,
          userProfile: null
        });
      },

      // 지갑 정보 관리
      fetchWalletInfo: async () => {
        try {
          const result = await getWalletInfo();
          if (result.success && result.data) {
            console.log(`💰 지갑 잔액: ${result.data.balance} DMC`);
            set({ walletInfo: result.data });
          } else {
            console.error('지갑 정보 조회 실패:', result.error);
            
            // 인증 오류인 경우 폴링 중지
            if (result.error?.includes('401') || result.error?.includes('인증')) {
              console.log('인증 오류로 인한 지갑 폴링 중지');
              get().stopWalletPolling();
            }
            
            set({ error: result.error || '지갑 정보 조회에 실패했습니다.' });
          }
        } catch (error: unknown) {
          console.error('지갑 정보 가져오기 실패:', error);
          set({ error: error instanceof Error ? error.message : '지갑 정보 가져오기 실패' });
        }
      },

      updateWalletBalance: (balance: number) => {
        const currentWalletInfo = get().walletInfo;
        if (currentWalletInfo) {
          set({
            walletInfo: { ...currentWalletInfo, balance }
          });
        }
      },

      startWalletPolling: () => {
        if (get().walletPollingInterval) {
          console.warn('지갑 폴링이 이미 시작되었습니다.');
          return;
        }

        console.log('🪙 지갑 정보 자동 폴링 시작 (3초 간격)');
        
        const intervalId = setInterval(() => {
          console.log('🔄 지갑 정보 조회 중...');
          get().fetchWalletInfo();
        }, 3000);

        set({ walletPollingInterval: intervalId });
      },

      stopWalletPolling: () => {
        const intervalId = get().walletPollingInterval;
        if (intervalId) {
          console.log('⏹️ 지갑 정보 폴링 중지');
          clearInterval(intervalId);
          set({ walletPollingInterval: null });
        }
      },

      // 사용자 프로필 관리
      fetchUserProfile: async () => {
        try {
          const result = await getUserInfo();
          if (result.success && result.data) {
            console.log('사용자 프로필 정보 조회 성공');
            set({ userProfile: result.data });
          } else {
            console.error('사용자 프로필 정보 조회 실패:', result.error);
            set({ error: result.error || '사용자 프로필 정보 조회에 실패했습니다.' });
          }
        } catch (error: unknown) {
          console.error('사용자 프로필 정보 조회 실패:', error);
          set({ error: error instanceof Error ? error.message : '사용자 프로필 정보 조회 실패' });
        }
      },

      // 최근 커밋 내역(지갑 history)
      history: [],
      fetchWalletHistory: async (page = 0) => {
        try {
          const result = await getWalletHistory(page);
          if (result.success && result.data) {
            set({ history: result.data.history });
          } else {
            set({ error: result.error || '지갑 내역 조회에 실패했습니다.' });
          }
        } catch (error: unknown) {
          set({ error: error instanceof Error ? error.message : '지갑 내역 조회 실패' });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        walletInfo: state.walletInfo,
        userProfile: state.userProfile
      })
    }
  )
); 