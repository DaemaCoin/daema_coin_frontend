'use client';

import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import LoginPage from '@/components/LoginPage';
import MiningDashboard from '@/components/MiningDashboard';
import Header from '@/components/layout/Header';
import WalletPollingProvider from '@/components/WalletPollingProvider';
import Leaderboard from '@/components/Leaderboard';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <>
      <WalletPollingProvider />
      {!isAuthenticated || !user ? (
        <LoginPage />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
          <Header />
          <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
            {/* 모바일: 세로 스택, 데스크톱: 2/3 + 1/3 그리드 */}
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* 메인 콘텐츠 (마이닝 대시보드) */}
              <div className="order-2 lg:order-1 lg:col-span-2">
                <MiningDashboard />
              </div>
              
              {/* 사이드바 (리더보드) - 모바일에서는 위쪽에 배치 */}
              <div className="order-1 lg:order-2 lg:col-span-1">
                <div className="lg:sticky lg:top-4">
                  <Leaderboard limit={8} />
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
}
