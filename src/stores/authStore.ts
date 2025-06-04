import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, User, XquareLoginForm } from '@/types';
import { 
  xquareLogin, 
  register, 
  saveTokens, 
  clearTokens, 
  saveTemporaryXquareId,
  getTemporaryXquareId,
  clearTemporaryXquareId
} from '@/lib/api';

interface AuthStore extends AuthState {
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

      // XQUARE 로그인
      loginWithXquare: async (formData: XquareLoginForm) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await xquareLogin(formData.accountId, formData.password);
          
          if (result.success && result.data) {
            // xquareId를 세션 스토리지에 임시 저장
            saveTemporaryXquareId(result.data.xquareId);
            
            set({ 
              xquareId: result.data.xquareId,
              isLoading: false 
            });
            return true;
          } else {
            set({ 
              error: result.error || 'XQUARE 로그인에 실패했습니다.',
              isLoading: false 
            });
            return false;
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'XQUARE 로그인 중 오류가 발생했습니다.',
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
              totalCoins: registerResult.data.totalCoins || 1250, // 시작 보너스
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
            
            return true;
          } else {
            set({ 
              error: registerResult.error || '회원가입에 실패했습니다.',
              isLoading: false 
            });
            return false;
          }
        } catch (error: any) {
          console.error('회원가입 처리 중 오류:', error);
          set({ 
            error: error.message || '회원가입 중 오류가 발생했습니다.',
            isLoading: false 
          });
          return false;
        }
      },

      // 로그아웃
      logout: () => {
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
          refreshToken: null
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
        clearTokens();
        clearTemporaryXquareId();
        set({
          user: null,
          isAuthenticated: false,
          xquareId: null,
          githubInfo: null,
          accessToken: null,
          refreshToken: null
        });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      })
    }
  )
); 