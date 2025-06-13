'use client';

import React, { useState } from 'react';
import { Coins, GitCommit, Trophy, Pickaxe } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useMiningStore } from '@/stores/miningStore';
import { useAuthStore } from '@/stores/authStore';
import Card from '@/components/ui/Card';

const MiningDashboard: React.FC = () => {
  const { walletInfo, userProfile, history, fetchWalletHistory } = useAuthStore();
  const { 
    recentCommits, 
    addCommit 
  } = useMiningStore();

  const [showAnimation, setShowAnimation] = useState(false);

  React.useEffect(() => {
    fetchWalletHistory();
    // eslint-disable-next-line
  }, []);

  // 정기적으로 데모 커밋 시뮬레이션 (실제로는 GitHub 웹훅으로 처리)
  React.useEffect(() => {
    const interval = setInterval(() => {
      // 랜덤하게 커밋 시뮬레이션 (30% 확률)
      if (Math.random() < 0.3) {
      simulateCommit();
    }
    }, 10000); // 10초마다 체크

    return () => clearInterval(interval);
  }, []);

  const simulateCommit = () => {
    // 실제 환경에서는 GitHub API를 호출하여 실제 커밋을 가져와야 함
    const demoCommit = {
      id: `commit_${Date.now()}`,
      sha: `${Math.random().toString(36).substr(2, 7)}`,
      message: '채굴 시스템 구현 완료',
      author: userProfile?.githubId || 'developer',
      date: new Date().toISOString(),
      repository: 'daemacoin-frontend',
      coinsEarned: Math.floor(Math.random() * 50) + 10,
      isMined: true,
      additions: Math.floor(Math.random() * 100) + 20,
      deletions: Math.floor(Math.random() * 50) + 5,
      changedFiles: Math.floor(Math.random() * 10) + 1
    };

      addCommit(demoCommit);
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 1000);
  };

  return (
    <div className="space-y-8">
      {/* 메인 채굴 섹션 */}
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-gray-900 leading-tight">
            GitHub으로<br />
            <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
              코인 채굴
            </span>
            하세요! 🚀
          </h1>
          <p className="text-gray-600 text-xl font-medium">
            코드를 작성하고 커밋할 때마다 대마코인이 자동으로 채굴됩니다
          </p>
        </div>

        {/* 채굴 애니메이션 */}
        <div className="flex justify-center">
          <div className="relative toss-float">
            <div className="w-40 h-40 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl mining-animation">
              <Pickaxe className="w-20 h-20 text-white pickaxe-mining" />
            </div>
            <div className="absolute -top-3 -right-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-2xl flex items-center justify-center toss-bounce-in shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            {/* 코인 파티클 효과 */}
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-400 rounded-full animate-ping opacity-75 animation-delay-500"></div>
            <div className="absolute top-2 -left-4 w-3 h-3 bg-pink-400 rounded-full animate-ping opacity-50 animation-delay-300"></div>
          </div>
        </div>

        {/* 채굴 상태 */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 border-2 border-green-200 shadow-lg">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-bold text-green-700">채굴 진행 중...</span>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse animation-delay-300"></div>
            </div>
            <p className="text-green-600 font-medium">
              GitHub 커밋을 실시간으로 감지하고 있습니다 ⚡
            </p>
          </div>
        </div>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 rounded-3xl p-8 border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-lg">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold mb-2">총 보유 코인</p>
              <p className="text-3xl font-black text-gray-900">
                {walletInfo?.balance?.toLocaleString() || 0}
              </p>
              <p className="text-lg font-bold text-yellow-600">DMC</p>
            </div>
          </div>
          <div className="mt-6 flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            실시간 업데이트 중
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-3xl p-8 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg">
              <GitCommit className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold mb-2">총 커밋 수</p>
              <p className="text-3xl font-black text-gray-900">
                {userProfile?.totalCommits || 0}
              </p>
              <p className="text-lg font-bold text-blue-600">commits</p>
            </div>
          </div>
          <div className="mt-6 flex items-center text-sm text-gray-600">
            <GitCommit className="w-4 h-4 mr-2 text-blue-500" />
            GitHub 연동 중
          </div>
        </div>
      </div>

      {/* 최근 커밋 내역 */}
      <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-3xl mr-3">📝</span>
              최근 커밋 내역
            </h2>
            <div className="flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-2xl border border-yellow-200">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-yellow-700 font-semibold">채굴된 코인</span>
            </div>
          </div>

          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">⛏️</div>
                <p className="text-gray-600 text-xl font-semibold mb-2">아직 채굴된 커밋이 없습니다</p>
                <p className="text-gray-500">GitHub에 커밋하면 자동으로 채굴됩니다! 🎯</p>
              </div>
            ) : (
              history.map((item, index) => (
                <div
                  key={item.id}
                  className={`relative overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                    index === 0 && showAnimation ? 'coin-drop animate-bounce' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                          <GitCommit className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-gray-900 text-lg">
                          {item.message}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 font-medium ml-13">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span>{item.repoName}</span>
                        </div>
                        <span>•</span>
                        <span>{format(new Date(item.createdAt), 'MM/dd HH:mm', { locale: ko })}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Coins className="w-6 h-6 text-yellow-500" />
                          <span className="font-black text-xl text-gray-900">
                            {item.amount > 0 ? `+${item.amount}` : item.amount}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 font-semibold mt-1">DMC</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 배경 장식 */}
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
                    <div className="w-full h-full bg-gradient-to-bl from-blue-400 to-indigo-500 rounded-bl-full"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiningDashboard; 