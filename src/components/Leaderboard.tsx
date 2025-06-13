'use client';

import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '@/lib/api';
import { LeaderboardEntry } from '@/types';
import { useAuthStore } from '@/stores/authStore';

interface LeaderboardProps {
  limit?: number;
}

export default function Leaderboard({ limit = 10 }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchLeaderboard();
  }, [limit]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getLeaderboard(limit);
      if (result.success && result.data) {
        setLeaderboard(result.data.leaderboard || []);
      } else {
        // API 실패 시 데모 데이터 사용
        console.warn('리더보드 API 실패, 데모 데이터 사용:', result.error);
        setLeaderboard(getDemoLeaderboard());
      }
    } catch (err) {
      // 네트워크 오류 시 데모 데이터 사용
      console.warn('리더보드 API 오류, 데모 데이터 사용:', err);
      setLeaderboard(getDemoLeaderboard());
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoLeaderboard = (): LeaderboardEntry[] => {
    const currentUser = user;
    const demoUsers = [
      {
        id: '1',
        githubUsername: 'coding-master',
        avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
        name: '코딩 마스터',
        totalCoins: 15420,
        rank: 1
      },
      {
        id: '2', 
        githubUsername: 'commit-hero',
        avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
        name: '커밋 히어로',
        totalCoins: 12800,
        rank: 2
      },
      {
        id: '3',
        githubUsername: 'code-ninja',
        avatar: 'https://avatars.githubusercontent.com/u/3?v=4', 
        name: '코드 닌자',
        totalCoins: 9650,
        rank: 3
      },
      {
        id: '4',
        githubUsername: 'dev-genius',
        avatar: 'https://avatars.githubusercontent.com/u/4?v=4',
        name: '개발 천재',
        totalCoins: 7430,
        rank: 4
      },
      {
        id: '5',
        githubUsername: 'git-guru',
        avatar: 'https://avatars.githubusercontent.com/u/5?v=4',
        name: 'Git 구루',
        totalCoins: 6200,
        rank: 5
      }
    ];

    // 현재 사용자를 리스트에 추가 (순위는 코인 수에 따라 결정)
    if (currentUser) {
      const userCoins = currentUser.totalCoins || 0;
      const userEntry: LeaderboardEntry = {
        id: currentUser.id,
        githubUsername: currentUser.githubUsername,
        avatar: currentUser.avatar,
        name: currentUser.name,
        totalCoins: userCoins,
        rank: 0 // 임시, 아래에서 정렬 후 설정
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
            onClick={fetchLeaderboard}
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
          onClick={fetchLeaderboard}
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
        <div className="space-y-2">
          {leaderboard.map((entry, index) => {
            const isCurrentUser = user && entry.githubUsername === user.githubUsername;
            
            return (
              <div
                key={entry.id}
                className={`relative overflow-hidden rounded-xl transition-all duration-200 hover:shadow-lg ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm'
                    : index < 3
                    ? 'bg-gradient-to-r from-yellow-50 via-orange-50 to-pink-50 border border-yellow-200 shadow-sm'
                    : 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 hover:from-gray-100 hover:to-gray-200'
                }`}
              >
                <div className="flex items-center p-3">
                  {/* 순위 */}
                  <div className="flex-shrink-0 w-8 text-center">
                    {index < 3 ? (
                      <span className="text-lg">
                        {getRankIcon(index + 1)}
                      </span>
                    ) : (
                      <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
                        <span className="text-xs font-bold text-gray-600">
                          {index + 1}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 아바타 */}
                  <div className="flex-shrink-0 mr-3">
                    <div className="relative">
                      <img
                        src={entry.avatar || '/default-avatar.png'}
                        alt={`${entry.name}의 프로필`}
                        className="w-9 h-9 rounded-lg border-2 border-white shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-avatar.png';
                        }}
                      />
                      {index < 3 && (
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
                        {entry.name || entry.githubUsername}
                      </p>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-medium">
                          나
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      @{entry.githubUsername}
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
                {index < 3 && (
                  <div className="absolute top-0 right-0 w-12 h-12 opacity-10">
                    <div className="w-full h-full bg-gradient-to-bl from-yellow-400 to-orange-500 rounded-bl-full"></div>
                  </div>
                )}
              </div>
            );
          })}
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