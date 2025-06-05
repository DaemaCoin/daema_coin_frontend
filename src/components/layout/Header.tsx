'use client';

import React from 'react';
import Image from 'next/image';
import { Coins, User, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated, walletInfo, userProfile } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900">대마코인</span>
          </div>

          {/* 사용자 정보 및 메뉴 */}
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-4">
              {/* 코인 보유량 */}
              <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold text-gray-900">
                  {walletInfo?.balance?.toLocaleString() || 0} DMC
                </span>
              </div>

              {/* 사용자 프로필 */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={userProfile?.githubImageUrl || user.avatar || '/default-avatar.svg'}
                    alt={userProfile?.githubId || user.name}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.githubId || user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    @{userProfile?.githubId || user.githubUsername}
                  </p>
                </div>
              </div>

              {/* 메뉴 버튼들 */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="p-2"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">로그인이 필요합니다</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 