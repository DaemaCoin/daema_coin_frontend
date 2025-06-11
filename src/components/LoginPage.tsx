'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Github, Shield, Coins, ChevronRight, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { startGithubOAuth } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import GithubWarningModal from './GithubWarningModal';
import StepIndicator from './StepIndicator';
import ErrorCard from './ErrorCard';

type LoginStep = 'xquare' | 'github';

const LoginPage: React.FC = () => {
  const [step, setStep] = useState<LoginStep>('xquare');
  const [formData, setFormData] = useState({
    accountId: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({
    accountId: '',
    password: ''
  });
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [confirmationError, setConfirmationError] = useState('');

  const { 
    isLoading, 
    error, 
    xquareId, 
    isAuthenticated,
    loginWithXquare, 
    clearError 
  } = useAuthStore();

  const router = useRouter();

  // 이미 로그인된 사용자는 메인 페이지로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // XQUARE 로그인 성공 시 GitHub 단계로 이동 (아직 회원가입이 안 된 경우만)
  useEffect(() => {
    if (xquareId && step === 'xquare' && !isAuthenticated) {
      setStep('github');
    }
  }, [xquareId, step, isAuthenticated]);

  // 폼 유효성 검사
  const validateForm = useCallback(() => {
    const errors = { accountId: '', password: '' };
    let isValid = true;

    if (!formData.accountId.trim()) {
      errors.accountId = '계정 ID를 입력해주세요.';
      isValid = false;
    }

    if (!formData.password.trim()) {
      errors.password = '비밀번호를 입력해주세요.';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = '비밀번호는 6자 이상이어야 합니다.';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  }, [formData]);

  // XQUARE 로그인 처리
  const handleXquareLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    await loginWithXquare(formData);
  }, [clearError, validateForm, loginWithXquare, formData]);

  // GitHub OAuth 경고창 표시
  const handleShowGithubWarning = useCallback(() => {
    clearError();
    setShowWarningModal(true);
    setConfirmationText('');
    setConfirmationError('');
  }, [clearError]);

  // 경고창 확인 처리
  const handleConfirmWarning = useCallback(() => {
    if (confirmationText.trim() !== '확인했습니다') {
      setConfirmationError('"확인했습니다"를 정확히 입력해주세요.');
      return;
    }
    
    setShowWarningModal(false);
    startGithubOAuth();
  }, [confirmationText]);

  // 경고창 취소 처리
  const handleCancelWarning = useCallback(() => {
    setShowWarningModal(false);
    setConfirmationText('');
    setConfirmationError('');
  }, []);

  // 입력 변경 처리
  const handleInputChange = useCallback((field: 'accountId' | 'password') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // 에러 메시지 초기화
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [formErrors]);

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* 로고 및 제목 */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto">
            <Coins className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">대마코인</h1>
            <p className="text-gray-600 mt-2">GitHub 커밋으로 코인을 채굴하세요</p>
          </div>
        </div>

        <StepIndicator step={step} />

        {error && <ErrorCard error={error} />}

        {/* 로그인 카드 */}
        <Card className="space-y-6">
          {step === 'xquare' && (
            <>
              <div className="text-center space-y-2">
                <Shield className="w-12 h-12 text-blue-600 mx-auto" />
                <h2 className="text-xl font-bold text-gray-900">XQUARE 로그인</h2>
                <p className="text-sm text-gray-600">
                  XQUARE 계정으로 안전하게 로그인하세요
                </p>
              </div>
              
              <form onSubmit={handleXquareLogin} className="space-y-4">
                <Input
                  label="계정 ID"
                  type="text"
                  value={formData.accountId}
                  onChange={handleInputChange('accountId')}
                  error={formErrors.accountId}
                  placeholder="XQUARE 계정 ID를 입력하세요"
                />
                
                <Input
                  label="비밀번호"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  error={formErrors.password}
                  placeholder="비밀번호를 입력하세요"
                />
                
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full"
                  size="lg"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  XQUARE로 로그인
                </Button>
              </form>
            </>
          )}

          {step === 'github' && (
            <>
              <div className="text-center space-y-2">
                <Github className="w-12 h-12 text-gray-900 mx-auto" />
                <h2 className="text-xl font-bold text-gray-900">GitHub 연동</h2>
                <p className="text-sm text-gray-600">
                  GitHub 계정을 연동하여 커밋 기반 채굴을 시작하세요
                </p>
              </div>

              {xquareId && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">XQUARE 로그인 성공</span>
                  </div>
                  <p className="text-sm text-green-700">
                    ID: {xquareId.substring(0, 8)}...
                  </p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <h3 className="font-medium text-gray-900">연동 후 가능한 기능</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 실시간 커밋 감지 및 자동 채굴</li>
                  <li>• 커밋 품질에 따른 코인 보상</li>
                  <li>• 리포지토리별 채굴 통계</li>
                </ul>
              </div>
              
              <Button
                  onClick={handleShowGithubWarning}
                isLoading={isLoading}
                className="w-full bg-gray-900 hover:bg-gray-800"
                size="lg"
              >
                <Github className="w-5 h-5 mr-2" />
                GitHub 계정 연동
              </Button>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">안내</span>
                </div>
                <p className="text-sm text-blue-700">
                  GitHub 연동 후 자동으로 회원가입이 완료됩니다.
                </p>
              </div>
            </>
          )}
        </Card>

        {/* 푸터 */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>대마코인으로 개발 활동을 더욱 재미있게!</p>
          <p>© 2024 대마코인. All rights reserved.</p>
        </div>
      </div>
    </div>

      {/* Organization 경고 모달 */}
      <GithubWarningModal
        open={showWarningModal}
        confirmationText={confirmationText}
        confirmationError={confirmationError}
        onChange={setConfirmationText}
        onConfirm={handleConfirmWarning}
        onCancel={handleCancelWarning}
      />
    </>
  );
};

export default LoginPage; 