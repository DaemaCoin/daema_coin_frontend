'use client';

import React, { useState } from 'react';
import { Pickaxe, Send } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import LoginPage from '@/components/LoginPage';
import MiningDashboard from '@/components/MiningDashboard';
import Transfer from '@/components/Transfer';
import Header from '@/components/layout/Header';
import WalletPollingProvider from '@/components/WalletPollingProvider';
import Leaderboard from '@/components/Leaderboard';

type MainTab = 'mining' | 'transfer';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<MainTab>('mining');

  return (
    <>
      <WalletPollingProvider />
      {!isAuthenticated || !user ? (
        <LoginPage />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
          <Header />
          <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
            {/* 탭 네비게이션 */}
            <div className="mb-6 sm:mb-8">
              <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 inline-flex">
                <button
                  onClick={() => setActiveTab('mining')}
                  className={`flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === 'mining'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Pickaxe className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">채굴</span>
                </button>
                <button
                  onClick={() => setActiveTab('transfer')}
                  className={`flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === 'transfer'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">송금</span>
                </button>
              </div>
            </div>

            {/* 탭 콘텐츠 */}
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* 메인 콘텐츠 */}
              <div className="order-2 lg:order-1 lg:col-span-2">
                {activeTab === 'mining' && <MiningDashboard />}
                {activeTab === 'transfer' && <Transfer />}
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
