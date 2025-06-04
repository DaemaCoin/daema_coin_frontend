'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coins, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getGithubCodeFromUrl } from '@/lib/api';
import Card from '@/components/ui/Card';

const GitHubCallbackPage: React.FC = () => {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('GitHub 연동을 처리하고 있습니다...');
  
  const { registerWithGithub, error } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL에서 GitHub OAuth code 추출
        const code = getGithubCodeFromUrl();
        
        if (!code) {
          setStatus('error');
          setMessage('GitHub 인증 코드가 없습니다. 다시 시도해주세요.');
          return;
        }

        // GitHub code로 회원가입 진행
        const success = await registerWithGithub(code);
        
        if (success) {
          setStatus('success');
          setMessage('회원가입이 완료되었습니다! 메인 페이지로 이동합니다...');
          
          // 2초 후 메인 페이지로 리다이렉트
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(error || '회원가입에 실패했습니다. 다시 시도해주세요.');
        }
      } catch (err: unknown) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : '처리 중 오류가 발생했습니다.');
      }
    };

    handleCallback();
  }, [registerWithGithub, error, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* 로고 */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto">
            <Coins className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-4">대마코인</h1>
        </div>

        {/* 상태 카드 */}
        <Card className="text-center space-y-4">
          {status === 'loading' && (
            <>
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">처리 중...</h2>
                <p className="text-sm text-gray-600 mt-1">{message}</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">완료!</h2>
                <p className="text-sm text-gray-600 mt-1">{message}</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Coins className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">시작 보너스</span>
                </div>
                <p className="text-sm text-yellow-700">
                  첫 로그인 보너스로 <span className="font-bold">1,250 DMC</span>를 받았습니다!
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">오류 발생</h2>
                <p className="text-sm text-gray-600 mt-1">{message}</p>
              </div>
              
              <button
                onClick={() => router.push('/')}
                className="toss-button toss-button-primary w-full"
              >
                메인 페이지로 돌아가기
              </button>
            </>
          )}
        </Card>

        {/* 로딩 중일 때만 추가 정보 표시 */}
        {status === 'loading' && (
          <div className="text-center text-xs text-gray-500">
            <p>GitHub 계정 정보를 확인하고 있습니다...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubCallbackPage; 