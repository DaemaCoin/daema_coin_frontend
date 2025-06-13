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
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 메인 콘텐츠 (마이닝 대시보드) */}
              <div className="lg:col-span-2">
                <MiningDashboard />
              </div>
              
              {/* 사이드바 (리더보드) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4">
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
