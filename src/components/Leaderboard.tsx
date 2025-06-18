'use client';

import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { getLeaderboard } from '@/lib/api';
import { LeaderboardEntry, LeaderboardResponse } from '@/types';
import { useAuthStore } from '@/stores/authStore';

interface LeaderboardProps {
  limit?: number;
}

export default function Leaderboard({ limit = 10 }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // 페이지네이션 상태를 추적하는 ref
  const stateRef = useRef({
    currentPage: 0,
    hasMore: true,
    isLoadingMore: false,
    isLoading: true
  });

  // 상태 업데이트 시 ref도 함께 업데이트
  useEffect(() => {
    stateRef.current = {
      currentPage,
      hasMore,
      isLoadingMore,
      isLoading
    };
  }, [currentPage, hasMore, isLoadingMore, isLoading]);

  useEffect(() => {
    fetchLeaderboard(0, true);
  }, [limit]);

  const fetchLeaderboard = useCallback(async (page = 0, reset = false) => {
    console.log('🚀 fetchLeaderboard 시작:', { page, reset, limit });
    
    // 중복 호출 방지
    if (!reset && (stateRef.current.isLoadingMore || !stateRef.current.hasMore)) {
      console.log('❌ 중복 호출 방지:', { 
        isLoadingMore: stateRef.current.isLoadingMore, 
        hasMore: stateRef.current.hasMore 
      });
      return;
    }
    
    if (reset) {
      setIsLoading(true);
      setError(null);
      stateRef.current.isLoading = true;
    } else {
      setIsLoadingMore(true);
      stateRef.current.isLoadingMore = true;
    }
    
    try {
      const result = await getLeaderboard(page, limit);
      console.log('📡 API 응답:', result);
      
      if (result.success && result.data) {
        const response: LeaderboardResponse = result.data;
        const newItems = response.items || [];
        
        console.log('✅ API 성공:', {
          currentPage: response.currentPage,
          hasNext: response.hasNext,
          itemsCount: newItems.length,
          totalPages: response.totalPages,
          totalUsers: response.totalUsers
        });
        
        if (reset) {
          setLeaderboard(newItems);
        } else {
          setLeaderboard(prev => [...prev, ...newItems]);
        }
        
        // 상태 업데이트
        setCurrentPage(response.currentPage);
        setHasMore(response.hasNext);
        stateRef.current.currentPage = response.currentPage;
        stateRef.current.hasMore = response.hasNext;
        
        console.log('🔄 상태 업데이트:', {
          currentPage: response.currentPage,
          hasMore: response.hasNext
        });
      } else {
        // API 실패 시 데모 데이터 사용
        console.warn('리더보드 API 실패, 데모 데이터 사용:', result.error);
        if (reset) {
          setLeaderboard(getDemoLeaderboard());
          setHasMore(false);
          stateRef.current.hasMore = false;
        }
        setError(result.error || '데이터를 불러올 수 없습니다.');
      }
    } catch (err) {
      // 네트워크 오류 시 데모 데이터 사용
      console.warn('리더보드 API 오류, 데모 데이터 사용:', err);
      if (reset) {
        setLeaderboard(getDemoLeaderboard());
        setHasMore(false);
        stateRef.current.hasMore = false;
      }
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      stateRef.current.isLoading = false;
      stateRef.current.isLoadingMore = false;
    }
  }, [limit]);

  // Intersection Observer 설정
  useEffect(() => {
    console.log('🔭 Observer 설정');
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        console.log('👁️ Observer 트리거:', { 
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio
        });
        
        if (entry.isIntersecting) {
          console.log('✨ 무한스크롤 조건 체크 중...');
          console.log('📊 현재 상태:', {
            hasMore: stateRef.current.hasMore,
            isLoadingMore: stateRef.current.isLoadingMore,
            currentPage: stateRef.current.currentPage
          });
          
          if (stateRef.current.hasMore && !stateRef.current.isLoadingMore) {
            console.log('🚀 무한스크롤 실행!');
            fetchLeaderboard(stateRef.current.currentPage + 1, false);
          } else {
            console.log('❌ 무한스크롤 조건 불충족');
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        root: null,
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      console.log('🎯 Observer target 관찰 시작');
      observer.observe(currentTarget);
    } else {
      console.warn('⚠️ Observer target이 없습니다!');
    }

    return () => {
      if (currentTarget) {
        console.log('🔴 Observer 정리');
        observer.unobserve(currentTarget);
      }
    };
  }, [fetchLeaderboard]);

  const getDemoLeaderboard = (): LeaderboardEntry[] => {
    const currentUser = user;
    const demoUsers: LeaderboardEntry[] = [
      {
        rank: 1,
        githubId: 'coding-master',
        profileImageUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
        totalCoins: 15420
      },
      {
        rank: 2,
        githubId: 'commit-hero',
        profileImageUrl: 'https://avatars.githubusercontent.com/u/2?v=4',
        totalCoins: 12800
      },
      {
        rank: 3,
        githubId: 'code-ninja',
        profileImageUrl: 'https://avatars.githubusercontent.com/u/3?v=4',
        totalCoins: 9650
      },
      {
        rank: 4,
        githubId: 'dev-master',
        profileImageUrl: 'https://avatars.githubusercontent.com/u/4?v=4',
        totalCoins: 8340
      },
      {
        rank: 5,
        githubId: 'algorithm-god',
        profileImageUrl: 'https://avatars.githubusercontent.com/u/5?v=4',
        totalCoins: 7820
      },
      {
        rank: 6,
        githubId: 'frontend-wizard',
        profileImageUrl: 'https://avatars.githubusercontent.com/u/6?v=4',
        totalCoins: 6950
      },
      {
        rank: 7,
        githubId: 'backend-guru',
        profileImageUrl: 'https://avatars.githubusercontent.com/u/7?v=4',
        totalCoins: 5780
      }
    ];

    // 현재 사용자가 있으면 리스트에 추가 (8등으로)
    if (currentUser?.githubId) {
      demoUsers.push({
        rank: 8,
        githubId: currentUser.githubId || currentUser.githubUsername || 'user',
        profileImageUrl: currentUser.avatar || 'https://avatars.githubusercontent.com/u/0?v=4',
        totalCoins: currentUser.totalCoins || 1000
      });
    }

    return demoUsers;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${rank}`;
    }
  };

  const formatCoins = (coins: number) => {
    if (coins >= 1000000) {
      return `${(coins / 1000000).toFixed(1)}M`;
    }
    if (coins >= 1000) {
      return `${(coins / 1000).toFixed(1)}K`;
    }
    return coins.toLocaleString();
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 border border-gray-100 h-fit">
      <div className="space-y-4 sm:space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
            <span className="text-xl sm:text-2xl lg:text-3xl mr-2 sm:mr-3">🏆</span>
            리더보드
          </h2>
          <div className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-yellow-200">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm text-yellow-700 font-semibold">
              페이지 {currentPage} {hasMore ? '(더 있음)' : '(마지막)'}
            </span>
          </div>
        </div>

        {/* 리더보드 리스트 */}
        {isLoading ? (
          <div className="space-y-3 sm:space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center space-x-3 sm:space-x-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full"></div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-1 sm:mb-2"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div 
            className="leaderboard-scroll space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto pr-1 sm:pr-2"
            onScroll={(e) => {
              e.stopPropagation();
            }}
          >
            {leaderboard.map((entry) => (
              <div
                key={`${entry.rank}-${entry.githubId}`}
                className={`bg-gradient-to-r hover:shadow-md transition-all duration-300 rounded-xl sm:rounded-2xl p-3 sm:p-4 border ${
                  user?.githubId === entry.githubId || user?.githubUsername === entry.githubId
                    ? 'from-blue-50 to-indigo-50 border-blue-200 ring-2 ring-blue-100'
                    : 'from-gray-50 to-gray-100 border-gray-200 hover:from-blue-50 hover:to-indigo-50'
                }`}
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  {/* 순위 */}
                  <div className="flex-shrink-0">
                    {entry.rank <= 3 ? (
                      <div className="text-lg sm:text-xl lg:text-2xl">
                        {getRankIcon(entry.rank)}
                      </div>
                    ) : (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                        {entry.rank}
                      </div>
                    )}
                  </div>

                  {/* 프로필 이미지 */}
                  <div className="flex-shrink-0">
                    <img
                      src={entry.profileImageUrl}
                      alt={`${entry.githubId} 프로필`}
                      className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full border-2 border-white shadow-sm"
                      loading="lazy"
                    />
                  </div>

                  {/* 사용자 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className={`font-bold truncate text-sm sm:text-base ${
                          user?.githubId === entry.githubId || user?.githubUsername === entry.githubId
                            ? 'text-blue-700'
                            : 'text-gray-900'
                        }`}>
                          {entry.githubId}
                          {(user?.githubId === entry.githubId || user?.githubUsername === entry.githubId) && (
                            <span className="ml-1 sm:ml-2 text-xs bg-blue-100 text-blue-600 px-1.5 sm:px-2 py-0.5 rounded-full">
                              ME
                            </span>
                          )}
                        </p>
                      </div>
                      
                      {/* 코인 정보 */}
                      <div className="text-right ml-2 sm:ml-3">
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500 text-sm sm:text-base">🪙</span>
                          <span className="font-black text-gray-900 text-sm sm:text-base">
                            {formatCoins(entry.totalCoins)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">DMC</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* 무한스크롤 트리거 */}
            <div ref={observerTarget} className="h-2 sm:h-4"></div>

            {/* 로딩 인디케이터 */}
            {isLoadingMore && (
              <div className="text-center py-3 sm:py-4">
                <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 text-blue-600 rounded-full text-xs sm:text-sm">
                  <div className="animate-spin rounded-full h-3 h-3 sm:h-4 sm:w-4 border-b-2 border-blue-600 mr-2"></div>
                  더 많은 사용자 불러오는 중...
                </div>
              </div>
            )}

            {/* 수동 더 보기 버튼 (디버깅용) */}
            {hasMore && !isLoadingMore && leaderboard.length > 0 && (
              <div className="text-center py-3 sm:py-4">
                <button
                  onClick={() => fetchLeaderboard(currentPage + 1, false)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors"
                >
                  더 보기 (페이지 {currentPage + 1})
                </button>
              </div>
            )}

            {/* 끝 표시 */}
            {!hasMore && leaderboard.length > 0 && (
              <div className="text-center py-3 sm:py-4">
                <p className="text-xs sm:text-sm text-gray-500">모든 사용자를 불러왔습니다 ✨</p>
              </div>
            )}
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="text-center py-6 sm:py-8">
            <div className="text-red-500 text-sm sm:text-base mb-2">⚠️ {error}</div>
            <button
              onClick={() => {
                setError(null);
                fetchLeaderboard(0, true);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && !error && leaderboard.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-5xl lg:text-6xl mb-4">🏆</div>
            <p className="text-gray-500 text-sm sm:text-base mb-2">아직 참가자가 없습니다</p>
            <p className="text-gray-400 text-xs sm:text-sm">첫 번째 채굴자가 되어보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
} 