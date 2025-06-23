'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, ArrowLeft, Send, Check, X, User, ChevronRight } from 'lucide-react';
import { getUsers, transferCoin } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

interface User {
  id: string;
  githubId: string;
  githubImageUrl: string;
  totalCommits: number;
  dailyCoinAmount: number;
  lastCoinDate: string;
}

interface Pagination {
  page: number;
  take: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

type TransferStep = 'select-recipient' | 'enter-amount' | 'confirm' | 'result';

const Transfer: React.FC = () => {
  const { walletInfo } = useAuthStore();
  const [step, setStep] = useState<TransferStep>('select-recipient');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [transferResult, setTransferResult] = useState<any>(null);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 사용자 목록 불러오기
  const fetchUsers = useCallback(async (page = 0, reset = false) => {
    setIsLoading(true);
    try {
      const result = await getUsers(page, 20);
      if (result.success) {
        if (reset) {
          setUsers(result.data.users);
        } else {
          setUsers(prev => [...prev, ...result.data.users]);
        }
        setPagination(result.data.pagination);
        setHasMoreUsers(result.data.pagination.hasNext);
      } else {
        setError(result.error || '사용자 목록을 불러올 수 없습니다.');
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 무한스크롤 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMoreUsers && !isLoading && pagination) {
          fetchUsers(pagination.page + 1, false);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        root: scrollRef.current,
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
  }, [hasMoreUsers, isLoading, pagination, fetchUsers]);

  // 초기 사용자 목록 로드
  useEffect(() => {
    fetchUsers(0, true);
  }, [fetchUsers]);

  // 검색 필터링된 사용자 목록
  const filteredUsers = users.filter(user =>
    user.githubId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 사용자 선택
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setStep('enter-amount');
  };

  // 금액 입력 키패드
  const handleNumberClick = (num: string) => {
    if (num === '.' && amount.includes('.')) return;
    if (amount === '0' && num !== '.') {
      setAmount(num);
    } else {
      setAmount(prev => prev + num);
    }
  };

  // 숫자 삭제
  const handleDelete = () => {
    if (amount.length > 1) {
      setAmount(prev => prev.slice(0, -1));
    } else {
      setAmount('0');
    }
  };

  // 전액 송금
  const handleSendAll = () => {
    setAmount(walletInfo?.balance?.toString() || '0');
  };

  // 송금 확인
  const handleConfirmTransfer = async () => {
    if (!selectedUser || !amount || parseFloat(amount) <= 0) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await transferCoin(selectedUser.id, parseFloat(amount));
      if (result.success) {
        setTransferResult(result.data);
        setStep('result');
      } else {
        setError(result.error || '송금에 실패했습니다.');
      }
    } catch (error) {
      setError('송금 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 처음부터 시작
  const handleStartOver = () => {
    setStep('select-recipient');
    setSelectedUser(null);
    setAmount('');
    setError('');
    setTransferResult(null);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {step !== 'select-recipient' && (
            <button
              onClick={() => {
                if (step === 'enter-amount') setStep('select-recipient');
                else if (step === 'confirm') setStep('enter-amount');
                else if (step === 'result') handleStartOver();
              }}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">송금</h1>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-xl">
          <p className="text-sm text-blue-600 font-medium">
            잔액: {walletInfo?.balance?.toLocaleString() || 0} DMC
          </p>
        </div>
      </div>

      {/* 받을 사람 선택 */}
      {step === 'select-recipient' && (
        <Card className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">누구에게 보낼까요?</h2>
            
            {/* 검색 입력 */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="GitHub ID로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="toss-input pl-12"
              />
            </div>

            {/* 사용자 목록 */}
            <div 
              ref={scrollRef}
              className="space-y-2 max-h-96 overflow-y-auto"
            >
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                >
                  <div className="relative">
                    {user.githubImageUrl ? (
                      <img
                        src={user.githubImageUrl}
                        alt={user.githubId}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{user.githubId}</p>
                    <p className="text-sm text-gray-500">
                      총 {user.totalCommits}회 커밋 • 일일 {user.dailyCoinAmount} DMC
                    </p>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}

              {/* 무한스크롤 트리거 */}
              <div ref={observerTarget} className="h-4"></div>
              
              {isLoading && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    사용자 목록 불러오는 중...
                  </div>
                </div>
              )}

              {!hasMoreUsers && filteredUsers.length > 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">모든 사용자를 불러왔습니다</p>
                </div>
              )}
            </div>

            {filteredUsers.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchTerm ? '검색 결과가 없습니다' : '사용자를 불러오는 중...'}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 금액 입력 */}
      {step === 'enter-amount' && selectedUser && (
        <Card className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              {selectedUser.githubImageUrl ? (
                <img
                  src={selectedUser.githubImageUrl}
                  alt={selectedUser.githubId}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <p className="text-lg font-semibold text-gray-900">{selectedUser.githubId}</p>
                <p className="text-sm text-gray-500">에게 보내기</p>
              </div>
            </div>

            {/* 금액 표시 */}
            <div className="space-y-2">
              <div className="text-4xl font-black text-gray-900">
                {amount || '0'} <span className="text-2xl text-blue-600">DMC</span>
              </div>
              <div className="flex justify-center space-x-2">
                <button
                  onClick={handleSendAll}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  전액
                </button>
                <button
                  onClick={() => setAmount('100')}
                  className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  100
                </button>
                <button
                  onClick={() => setAmount('1000')}
                  className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  1,000
                </button>
              </div>
            </div>

            {/* 키패드 */}
            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className="w-16 h-16 rounded-full bg-gray-50 hover:bg-gray-100 text-xl font-semibold text-gray-900 transition-colors active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleDelete}
                className="w-16 h-16 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors active:scale-95"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* 송금 버튼 */}
            <Button
              onClick={() => setStep('confirm')}
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > (walletInfo?.balance || 0)}
              className="w-full"
              size="lg"
            >
              <Send className="w-5 h-5 mr-2" />
              다음
            </Button>

            {parseFloat(amount) > (walletInfo?.balance || 0) && (
              <p className="text-sm text-red-500">잔액이 부족합니다</p>
            )}
          </div>
        </Card>
      )}

      {/* 송금 확인 */}
      {step === 'confirm' && selectedUser && (
        <Card className="space-y-6">
          <div className="text-center space-y-6">
            <h2 className="text-xl font-bold text-gray-900">송금 내용을 확인해주세요</h2>
            
            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-center space-x-3">
                {selectedUser.githubImageUrl ? (
                  <img
                    src={selectedUser.githubImageUrl}
                    alt={selectedUser.githubId}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold text-gray-900">{selectedUser.githubId}</p>
                  <p className="text-sm text-gray-500">받을 사람</p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-black text-blue-600">
                  {parseFloat(amount).toLocaleString()} DMC
                </p>
                <p className="text-sm text-gray-500 mt-1">송금 금액</p>
              </div>
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              <p>송금 후 잔액: {((walletInfo?.balance || 0) - parseFloat(amount)).toLocaleString()} DMC</p>
              <p>송금 수수료: 0 DMC (무료)</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              onClick={handleConfirmTransfer}
              isLoading={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Send className="w-5 h-5 mr-2" />
              {parseFloat(amount).toLocaleString()} DMC 송금하기
            </Button>
          </div>
        </Card>
      )}

      {/* 송금 결과 */}
      {step === 'result' && selectedUser && transferResult && (
        <Card className="space-y-6">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">송금 완료</h2>
              <p className="text-gray-600">송금이 성공적으로 완료되었습니다</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-center space-x-3">
                {selectedUser.githubImageUrl ? (
                  <img
                    src={selectedUser.githubImageUrl}
                    alt={selectedUser.githubId}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{selectedUser.githubId}</p>
                  <p className="text-sm text-gray-500">에게 송금됨</p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-black text-blue-600">
                  {parseFloat(amount).toLocaleString()} DMC
                </p>
              </div>
            </div>

            <Button
              onClick={handleStartOver}
              className="w-full"
              size="lg"
            >
              새로운 송금하기
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Transfer; 