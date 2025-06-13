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

  useEffect(() => {
    fetchLeaderboard(0, true);
  }, [limit]);

  // throttle 함수 (스크롤 이벤트 최적화)
  const throttle = useCallback((func: Function, limit: number) => {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  const loadMoreLeaderboard = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    await fetchLeaderboard(currentPage + 1, false);
  }, [hasMore, isLoadingMore, currentPage]);

  // Intersection Observer를 이용한 무한스크롤 (더 부드럽고 성능 좋음)
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          loadMoreLeaderboard();
        }
      },
      {
        threshold: 0.1, // 10% 보이면 트리거
        rootMargin: '20px', // 20px 여유분 두고 트리거
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
  }, [hasMore, isLoadingMore, loadMoreLeaderboard]);

  const fetchLeaderboard = async (page = 0, reset = false) => {
    if (reset) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    
    try {
      const result = await getLeaderboard(page, limit);
      if (result.success && result.data) {
        const response: LeaderboardResponse = result.data;
        const newItems = response.items || [];
        
        setLeaderboard(prev => reset ? newItems : [...prev, ...newItems]);
        setCurrentPage(response.currentPage);
        setHasMore(response.hasNext);
      } else {
        // API 실패 시 데모 데이터 사용
        console.warn('리더보드 API 실패, 데모 데이터 사용:', result.error);
        if (reset) {
          setLeaderboard(getDemoLeaderboard());
          setHasMore(false);
        }
      }
    } catch (err) {
      // 네트워크 오류 시 데모 데이터 사용
      console.warn('리더보드 API 오류, 데모 데이터 사용:', err);
      if (reset) {
        setLeaderboard(getDemoLeaderboard());
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };



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
        githubId: 'dev-genius',
        profileImageUrl: 'https://avatars.githubusercontent.com/u/4?v=4',
        totalCoins: 7430
      },
      {
        rank: 5,
        githubId: 'git-guru',
        profileImageUrl: 'https://avatars.githubusercontent.com/u/5?v=4',
        totalCoins: 6200
      }
    ];

    // 현재 사용자를 리스트에 추가 (순위는 코인 수에 따라 결정)
    if (currentUser) {
      const userCoins = currentUser.totalCoins || 0;
      const userEntry: LeaderboardEntry = {
        rank: 0, // 임시, 아래에서 정렬 후 설정
        githubId: currentUser.githubUsername,
        profileImageUrl: currentUser.avatar,
        totalCoins: userCoins
      };

      demoUsers.push(userEntry);
    }

    // 코인 수로 정렬하고 순위 설정
    const sortedUsers = demoUsers
      .sort((a, b) => b.totalCoins - a.totalCoins)
      .map((user, index) => ({ ...user, rank: index + 1 }))
      .slice(0, limit);

    return sortedUsers;
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
        return `#${rank}`;
    }
  };

  const formatCoins = (coins: number) => {
    return coins.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <span className="text-xl mr-2">🏆</span>
          리더보드
        </h2>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-2 animate-pulse">
              <div className="w-6 h-6 bg-gray-200 rounded-lg"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded-lg w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <span className="text-xl mr-2">🏆</span>
          리더보드
        </h2>
        <div className="text-center py-6">
          <div className="text-3xl mb-2">😅</div>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <button
            onClick={() => fetchLeaderboard(0, true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <span className="text-xl mr-2">🏆</span>
          리더보드
        </h2>
        <button
          onClick={() => fetchLeaderboard(0, true)}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-3">🎯</div>
          <p className="text-gray-500 text-sm">아직 등록된 사용자가 없습니다.</p>
        </div>
      ) : (
        <div 
          ref={scrollRef} 
          className="space-y-2 h-[300px] overflow-y-auto leaderboard-scroll"
          onWheel={(e) => {
            // 스크롤 이벤트가 부모로 전파되는 것을 방지
            e.stopPropagation();
          }}
        >
          {leaderboard.map((entry, index) => {
            const isCurrentUser = user && entry.githubId === user.githubUsername;
            
            return (
              <div
                key={entry.githubId}
                className={`relative overflow-hidden rounded-xl transition-all duration-200 hover:shadow-lg ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm'
                    : entry.rank <= 3
                    ? 'bg-gradient-to-r from-yellow-50 via-orange-50 to-pink-50 border border-yellow-200 shadow-sm'
                    : 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 hover:from-gray-100 hover:to-gray-200'
                }`}
              >
                <div className="flex items-center p-3">
                  {/* 순위 */}
                  <div className="flex-shrink-0 w-8 text-center">
                    {entry.rank <= 3 ? (
                      <span className="text-lg">
                        {getRankIcon(entry.rank)}
                      </span>
                    ) : (
                      <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
                        <span className="text-xs font-bold text-gray-600">
                          {entry.rank}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 아바타 */}
                  <div className="flex-shrink-0 mr-3">
                    <div className="relative">
                      <img
                        src={entry.profileImageUrl || '/default-avatar.png'}
                        alt={`${entry.githubId}의 프로필`}
                        className="w-9 h-9 rounded-lg border-2 border-white shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-avatar.png';
                        }}
                      />
                      {entry.rank <= 3 && (
                        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">★</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 사용자 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-gray-900 truncate text-sm">
                        {entry.githubId}
                      </p>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-medium">
                          나
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      @{entry.githubId}
                    </p>
                  </div>

                  {/* 코인 */}
                  <div className="flex-shrink-0 text-right">
                    <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-end space-x-1">
                        <span className="text-sm">🪙</span>
                        <span className="font-bold text-gray-900 text-sm">
                          {formatCoins(entry.totalCoins)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">DMC</div>
                    </div>
                  </div>
                </div>

                {/* 배경 장식 */}
                {entry.rank <= 3 && (
                  <div className="absolute top-0 right-0 w-12 h-12 opacity-10">
                    <div className="w-full h-full bg-gradient-to-bl from-yellow-400 to-orange-500 rounded-bl-full"></div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Intersection Observer 타겟 (무한스크롤 트리거) */}
          {hasMore && <div ref={observerTarget} className="h-1" />}

          {/* 로딩 인디케이터 */}
          {isLoadingMore && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="text-gray-600 text-xs">더 불러오는 중...</span>
              </div>
            </div>
          )}

          {/* 더 이상 데이터가 없을 때 */}
          {!hasMore && leaderboard.length > 0 && (
            <div className="text-center py-3">
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span className="text-xs">모든 사용자를 확인했습니다</span>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 하단 정보 */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">실시간 업데이트</span>
          </div>
          <span className="text-gray-500">상위 {leaderboard.length}명</span>
        </div>
      </div>
    </div>
  );
} 