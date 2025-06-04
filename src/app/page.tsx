'use client';

import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import LoginPage from '@/components/LoginPage';
import MiningDashboard from '@/components/MiningDashboard';
import Header from '@/components/layout/Header';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <MiningDashboard />
      </main>
    </div>
  );
}
