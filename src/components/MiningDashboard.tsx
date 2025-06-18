'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Coins, GitCommit, Trophy, Pickaxe, Target } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useMiningStore } from '@/stores/miningStore';
import { useAuthStore } from '@/stores/authStore';
import { getTodayMinedCoins } from '@/lib/api';
import Card from '@/components/ui/Card';

const MiningDashboard: React.FC = () => {
  const { 
    walletInfo, 
    userProfile, 
    history, 
    fetchWalletHistory, 
    loadMoreHistory,
    hasMoreHistory,
    isLoadingHistory 
  } = useAuthStore();
  const { 
    recentCommits, 
    addCommit 
  } = useMiningStore();

  const [showAnimation, setShowAnimation] = useState(false);
  const [todayMinedCoins, setTodayMinedCoins] = useState(0);
  const [isLoadingTodayMined, setIsLoadingTodayMined] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // 오늘 채굴된 코인 수 조회
  const fetchTodayMinedCoins = useCallback(async () => {
    setIsLoadingTodayMined(true);
    try {
      const result = await getTodayMinedCoins();
      if (result.success) {
        setTodayMinedCoins(result.data.totalAmount || 0);
      }
    } catch (error) {
      console.error('오늘 채굴된 코인 조회 실패:', error);
    } finally {
      setIsLoadingTodayMined(false);
    }
  }, []);

  React.useEffect(() => {
    fetchWalletHistory(0, true); // 초기 로드 시 reset=true
    fetchTodayMinedCoins(); // 오늘 채굴된 코인 수 조회
    // eslint-disable-next-line
  }, []);

  // 최적화된 무한스크롤 (Intersection Observer 사용)
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMoreHistory && !isLoadingHistory) {
          loadMoreHistory();
        }
      },
      {
        threshold: 0.1, // 10% 보이면 트리거
        rootMargin: '50px', // 50px 여유분 두고 트리거
        root: scrollRef.current, // 스크롤 컨테이너를 root로 설정
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMoreHistory, isLoadingHistory, loadMoreHistory]);

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

  // 정기적으로 오늘의 채굴 현황 업데이트
  React.useEffect(() => {
    const interval = setInterval(() => {
      fetchTodayMinedCoins();
    }, 30000); // 30초마다 업데이트

    return () => clearInterval(interval);
  }, [fetchTodayMinedCoins]);

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
    
    // 커밋 후 오늘의 채굴 현황 업데이트
    setTimeout(() => {
      fetchTodayMinedCoins();
    }, 1500);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 메인 채굴 섹션 */}
      <div className="text-center space-y-6 sm:space-y-8">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
            GitHub으로<br />
            <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
              코인 채굴
            </span>
            하세요! 🚀
          </h1>
          <p className="text-gray-600 text-base sm:text-lg lg:text-xl font-medium px-4">
            코드를 작성하고 커밋할 때마다 대마코인이 자동으로 채굴됩니다
          </p>
        </div>

        {/* 채굴 애니메이션 */}
        <div className="flex justify-center">
          <div className="relative toss-float">
            <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl sm:shadow-2xl mining-animation">
              <Pickaxe className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-white pickaxe-mining" />
            </div>
            <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-xl sm:rounded-2xl flex items-center justify-center toss-bounce-in shadow-md sm:shadow-lg">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            {/* 코인 파티클 효과 */}
            <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
            <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-orange-400 rounded-full animate-ping opacity-75 animation-delay-500"></div>
            <div className="absolute top-1 -left-2 sm:top-2 sm:-left-4 w-2 h-2 sm:w-3 sm:h-3 bg-pink-400 rounded-full animate-ping opacity-50 animation-delay-300"></div>
          </div>
        </div>

        {/* 채굴 상태 */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-green-200 shadow-lg mx-2 sm:mx-0">
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-base sm:text-lg font-bold text-green-700">채굴 진행 중...</span>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse animation-delay-300"></div>
            </div>
            <p className="text-green-600 font-medium text-sm sm:text-base">
              GitHub 커밋을 실시간으로 감지하고 있습니다 ⚡
            </p>
          </div>
        </div>

        {/* 오늘의 채굴 현황 */}
        <div className="mining-status-card bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-blue-200 shadow-lg mx-2 sm:mx-0">
          <div className="mining-status-container text-center space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <span className="mining-status-title text-base sm:text-lg font-bold text-blue-700">오늘의 채굴 현황</span>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-center space-x-2">
                {isLoadingTodayMined ? (
                  <div className="mining-loading-spinner"></div>
                ) : (
                  <>
                    <span className={`mining-status-number text-xl sm:text-2xl font-black text-blue-900 ${todayMinedCoins >= 20 ? 'mining-status-complete' : ''}`}>
                      {todayMinedCoins}
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-blue-600">/</span>
                    <span className="text-lg sm:text-xl font-bold text-blue-600">20</span>
                    <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 ml-1" />
                  </>
                )}
              </div>
              
              {/* 진행률 바 */}
              <div className="mining-progress-container">
                <div className="mining-progress-bar w-full h-2 sm:h-3">
                  <div 
                    className="mining-progress-fill"
                    style={{ width: `${Math.min((todayMinedCoins / 20) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-xs sm:text-sm font-medium">
                {todayMinedCoins >= 20 ? (
                  <div className="mining-complete-message inline-block">
                    ✅ 오늘 채굴 완료! 내일 다시 도전하세요
                  </div>
                ) : (
                  <div className="mining-available-message inline-block">
                    앞으로 <span className="font-bold text-blue-800">{20 - todayMinedCoins}개</span> 더 채굴 가능
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg">
              <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1 sm:mb-2">총 보유 코인</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">
                {walletInfo?.balance?.toLocaleString() || 0}
              </p>
              <p className="text-sm sm:text-lg font-bold text-yellow-600">DMC</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 flex items-center text-xs sm:text-sm text-gray-600">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            실시간 업데이트 중
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg">
              <GitCommit className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1 sm:mb-2">총 커밋 수</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">
                {userProfile?.totalCommits || 0}
              </p>
              <p className="text-sm sm:text-lg font-bold text-blue-600">commits</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 flex items-center text-xs sm:text-sm text-gray-600">
            <GitCommit className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-500" />
            GitHub 연동 중
          </div>
        </div>
      </div>

      {/* 최근 커밋 내역 */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-xl sm:text-2xl lg:text-3xl mr-2 sm:mr-3">📝</span>
              최근 커밋 내역
            </h2>
            <div className="flex items-center space-x-1 sm:space-x-2 bg-yellow-50 px-2 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl border border-yellow-200">
              <Trophy className="w-3 h-3 sm:w-5 sm:h-5 text-yellow-500" />
              <span className="text-xs sm:text-sm text-yellow-700 font-semibold">채굴된 코인</span>
            </div>
          </div>

          <div className="mining-history-scroll space-y-3 sm:space-y-4 max-h-60 sm:max-h-80 lg:max-h-96 overflow-y-auto pr-2 sm:pr-4" ref={scrollRef}>
            {history?.length > 0 ? (
              <>
                {history.map((tx, index) => (
                  <div
                    key={tx.id || index}
                    className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-gray-100 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-1 sm:space-y-2">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                            <GitCommit className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                                                     <div>
                             <p className="font-bold text-gray-900 text-sm sm:text-base">
                               {tx.message || '코인 채굴'}
                             </p>
                             <p className="text-xs sm:text-sm text-gray-500">
                               {format(new Date(tx.createdAt), 'MM월 dd일 HH:mm', { locale: ko })}
                             </p>
                           </div>
                         </div>
                         
                         <p className="text-xs sm:text-sm text-gray-600 pl-8 sm:pl-11">
                           저장소: {tx.repoName}
                         </p>
                      </div>
                      
                      <div className="text-right ml-3 sm:ml-4">
                        <p className="font-black text-green-600 text-sm sm:text-lg flex items-center">
                          +{tx.amount.toLocaleString()}
                          <Coins className="w-3 h-3 sm:w-4 sm:h-4 ml-1 text-yellow-500" />
                        </p>
                        <p className="text-xs text-gray-500">DMC</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 무한 스크롤 트리거 */}
                <div ref={observerTarget} className="h-4"></div>
                
                {isLoadingHistory && (
                  <div className="text-center py-3 sm:py-4">
                    <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 text-blue-600 rounded-full text-xs sm:text-sm">
                      <div className="animate-spin rounded-full h-3 h-3 sm:h-4 sm:w-4 border-b-2 border-blue-600 mr-2"></div>
                      더 많은 내역 불러오는 중...
                    </div>
                  </div>
                )}

                {!hasMoreHistory && history.length > 0 && (
                  <div className="text-center py-3 sm:py-4">
                    <p className="text-xs sm:text-sm text-gray-500">모든 내역을 불러왔습니다 ✨</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <GitCommit className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm sm:text-base">아직 커밋 내역이 없습니다</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">GitHub에 코드를 커밋해보세요!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiningDashboard; 