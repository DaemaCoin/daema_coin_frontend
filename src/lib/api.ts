import axios from 'axios';

const API_BASE_URL = 'https://daemacoin-server.xquare.app';
const GITHUB_LOGIN_URL = 'https://github.com/login/oauth/authorize?client_id=Ov23liHgU8D73ZmDOReG&scope=write:repo_hook%20public_repo';

// API 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT 토큰 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 (토큰 만료 처리)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // zustand 상태도 초기화
      if (typeof window !== 'undefined') {
        import('@/stores/authStore').then(({ useAuthStore }) => {
          useAuthStore.getState().logout();
        });
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// XQUARE 로그인 API
export const xquareLogin = async (accountId: string, password: string) => {
  try {
    const response = await api.post('/auth/xquare', {
      accountId,
      password,
    });
    return { success: true, data: response.data };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: axios.isAxiosError(error) && error.response?.data?.message 
        ? error.response.data.message 
        : '로그인에 실패했습니다.' 
    };
  }
};

// 회원가입 API (xquareId + GitHub code 사용)
export const register = async (xquareId: string, code: string) => {
  try {
    console.log('Register API 호출:', { xquareId, code });
    
    const response = await api.post('/auth/register/', {
      xquareId,
      code,
    });
    return { success: true, data: response.data };
  } catch (error: unknown) {
    console.error('Register API 오류:', error);
    return { 
      success: false, 
      error: axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message 
        : axios.isAxiosError(error) && error.response?.data?.error
        ? error.response.data.error
        : '회원가입에 실패했습니다.' 
    };
  }
};

// GitHub OAuth 로그인 시작
export const startGithubOAuth = () => {
  // redirect_uri 없이 GitHub OAuth URL로 리다이렉트
  window.location.href = GITHUB_LOGIN_URL;
};

// URL에서 GitHub OAuth 코드 추출
export const getGithubCodeFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('code');
};

// URL에서 state 파라미터 추출
export const getStateFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('state');
};

// xquareId 임시 저장 (GitHub OAuth 전)
export const saveTemporaryXquareId = (xquareId: string) => {
  sessionStorage.setItem('temp_xquareId', xquareId);
};

// 임시 저장된 xquareId 가져오기
export const getTemporaryXquareId = (): string | null => {
  return sessionStorage.getItem('temp_xquareId');
};

// 임시 저장된 xquareId 제거
export const clearTemporaryXquareId = () => {
  sessionStorage.removeItem('temp_xquareId');
};

// 토큰 저장
export const saveTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

// 토큰 제거
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// 지갑 정보 조회 API
export const getWalletInfo = async () => {
  try {
    const response = await api.get('/wallet');
    return { success: true, data: response.data };
  } catch (error: unknown) {
    console.error('Wallet API 오류:', error);
    return { 
      success: false, 
      error: axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message 
        : '지갑 정보 조회에 실패했습니다.' 
    };
  }
};

// 사용자 정보 조회 API
export const getUserInfo = async () => {
  try {
    const response = await api.get('/auth/user');
    return { success: true, data: response.data };
  } catch (error: unknown) {
    console.error('User API 오류:', error);
    return { 
      success: false, 
      error: axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message 
        : '사용자 정보 조회에 실패했습니다.' 
    };
  }
};

// 지갑 내역(커밋 히스토리) 조회 API
export const getWalletHistory = async (page = 0) => {
  try {
    const response = await api.get(`/coin/history?page=${page}`);
    return { success: true, data: response.data };
  } catch (error: unknown) {
    console.error('Wallet History API 오류:', error);
    return {
      success: false,
      error: (error as any)?.response?.data?.message || '지갑 내역 조회에 실패했습니다.'
    };
  }
};

// 리더보드 조회 API
export const getLeaderboard = async (page = 0, limit = 10) => {
  try {
    const response = await api.get(`/leaderboard?page=${page}&limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error: unknown) {
    console.error('Leaderboard API 오류:', error);
    return {
      success: false,
      error: axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message 
        : '리더보드 조회에 실패했습니다.'
    };
  }
};

// 오늘 채굴된 코인 수 조회 API
export const getTodayMinedCoins = async () => {
  try {
    const response = await api.get('/coin/today-mined');
    return { success: true, data: response.data };
  } catch (error: unknown) {
    console.error('Today Mined Coins API 오류:', error);
    return {
      success: false,
      error: axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message 
        : '오늘 채굴된 코인 수 조회에 실패했습니다.'
    };
  }
};

// 사용자 목록 조회 API (페이지네이션)
export const getUsers = async (page = 0, take = 20) => {
  try {
    const response = await api.get(`/auth/users?page=${page}&take=${take}`);
    return { success: true, data: response.data };
  } catch (error: unknown) {
    console.error('Users API 오류:', error);
    return {
      success: false,
      error: axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message 
        : '사용자 목록 조회에 실패했습니다.'
    };
  }
};

// 코인 송금 API
export const transferCoin = async (to: string, amount: number) => {
  try {
    const response = await api.post('/coin/transfer', {
      to,
      amount
    });
    return { success: true, data: response.data };
  } catch (error: unknown) {
    console.error('Transfer API 오류:', error);
    return {
      success: false,
      error: axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message 
        : '송금에 실패했습니다.'
    };
  }
};

export { GITHUB_LOGIN_URL }; 