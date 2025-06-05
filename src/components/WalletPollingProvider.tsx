'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function WalletPollingProvider() {
  const { isAuthenticated, startWalletPolling, stopWalletPolling, walletPollingInterval } = useAuthStore();

  useEffect(() => {
    // 로그인된 상태이고 아직 폴링이 시작되지 않았다면 시작
    if (isAuthenticated && !walletPollingInterval) {
      console.log('지갑 폴링 자동 시작');
      startWalletPolling();
    }
    
    // 로그인되지 않은 상태이고 폴링이 실행 중이라면 중지
    if (!isAuthenticated && walletPollingInterval) {
      console.log('지갑 폴링 자동 중지');
      stopWalletPolling();
    }
  }, [isAuthenticated, walletPollingInterval, startWalletPolling, stopWalletPolling]);

  // 페이지를 떠날 때 폴링 정리
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (walletPollingInterval) {
        stopWalletPolling();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // 컴포넌트 언마운트 시에도 폴링 정리
      if (walletPollingInterval) {
        stopWalletPolling();
      }
    };
  }, [walletPollingInterval, stopWalletPolling]);

  return null; // UI를 렌더링하지 않는 provider 컴포넌트
} 