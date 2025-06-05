'use client';

import React, { useState } from 'react';
import { Play, Pause, Coins, GitCommit, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useMiningStore } from '@/stores/miningStore';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const MiningDashboard: React.FC = () => {
  const { user, walletInfo, fetchWalletInfo } = useAuthStore();
  const { 
    isActive, 
    currentSession, 
    recentCommits, 
    startMining, 
    stopMining,
    addCommit 
  } = useMiningStore();

  const [showAnimation, setShowAnimation] = useState(false);

  // 컴포넌트 마운트 시 지갑 정보 조회
  React.useEffect(() => {
    if (user && !walletInfo) {
      fetchWalletInfo();
    }
  }, [user, walletInfo, fetchWalletInfo]);

  const handleMining = () => {
    if (isActive) {
      stopMining();
    } else {
      startMining();
      // 데모용 커밋 시뮬레이션
      simulateCommit();
    }
  };

  const simulateCommit = () => {
    // 실제 환경에서는 GitHub API를 호출하여 실제 커밋을 가져와야 함
    const demoCommit = {
      id: `commit_${Date.now()}`,
      sha: `${Math.random().toString(36).substr(2, 7)}`,
      message: '채굴 시스템 구현 완료',
      author: user?.githubUsername || 'developer',
      date: new Date().toISOString(),
      repository: 'daemacoin-frontend',
      coinsEarned: Math.floor(Math.random() * 50) + 10,
      isMined: true,
      additions: Math.floor(Math.random() * 100) + 20,
      deletions: Math.floor(Math.random() * 50) + 5,
      changedFiles: Math.floor(Math.random() * 10) + 1
    };

    setTimeout(() => {
      addCommit(demoCommit);
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 1000);
      
      // 채굴 후 지갑 정보 업데이트
      setTimeout(() => {
        fetchWalletInfo();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 메인 채굴 섹션 */}
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900">
            GitHub 커밋으로 코인을 채굴하세요!
          </h1>
          <p className="text-gray-600">
            코드를 작성하고 커밋할 때마다 대마코인이 자동으로 채굴됩니다
          </p>
        </div>

        {/* 채굴 버튼 */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleMining}
            className={`text-lg px-12 py-6 ${isActive ? 'mining-animation' : ''}`}
            variant={isActive ? 'danger' : 'primary'}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                채굴 중지
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                채굴 시작
              </>
            )}
          </Button>
        </div>

        {/* 채굴 상태 */}
        {isActive && currentSession && (
          <Card className="bg-blue-50 border-blue-200">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700">채굴 중...</span>
              </div>
              <p className="text-xs text-blue-600">
                {format(new Date(currentSession.startTime), 'HH:mm:ss', { locale: ko })}부터 채굴 시작
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Coins className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">총 보유 코인</p>
              <p className="text-2xl font-bold text-gray-900">
                {walletInfo?.balance?.toLocaleString() || 0} DMC
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <GitCommit className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">총 커밋 수</p>
              <p className="text-2xl font-bold text-gray-900">
                {recentCommits.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 최근 커밋 내역 */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">최근 커밋 내역</h2>
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">채굴된 코인</span>
            </div>
          </div>

          <div className="space-y-3">
            {recentCommits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <GitCommit className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>아직 채굴된 커밋이 없습니다</p>
                <p className="text-sm">채굴을 시작하여 커밋을 업로드하세요!</p>
              </div>
            ) : (
              recentCommits.map((commit, index) => (
                <div
                  key={commit.id}
                  className={`p-4 bg-gray-50 rounded-xl transition-all duration-500 ${
                    index === 0 && showAnimation ? 'coin-drop' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <GitCommit className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {commit.message}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{commit.repository}</span>
                        <span>•</span>
                        <span>{format(new Date(commit.date), 'MM/dd HH:mm', { locale: ko })}</span>
                        <span>•</span>
                        <span className="text-green-600">+{commit.additions}</span>
                        <span className="text-red-600">-{commit.deletions}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-yellow-600">
                          +{commit.coinsEarned} DMC
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MiningDashboard; 