'use client';

import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import LoginPage from '@/components/LoginPage';
import MiningDashboard from '@/components/MiningDashboard';
import Header from '@/components/layout/Header';
import WalletPollingProvider from '@/components/WalletPollingProvider';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <>
      <WalletPollingProvider />
      {!isAuthenticated || !user ? (
        <LoginPage />
      ) : (
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <MiningDashboard />
          </main>
        </div>
      )}
    </>
  );
}
