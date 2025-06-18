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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-3 sm:p-4 lg:p-6">
      <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8">
        {/* 로고 및 제목 */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto">
            <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">대마코인</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">GitHub 커밋으로 코인을 채굴하세요</p>
          </div>
        </div>

        <StepIndicator step={step} />

        {error && <ErrorCard error={error} />}

        {/* 로그인 카드 */}
        <Card className="space-y-4 sm:space-y-6">
          {step === 'xquare' && (
            <>
              <div className="text-center space-y-2">
                <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">XQUARE 로그인</h2>
                <p className="text-xs sm:text-sm text-gray-600 px-2">
                  XQUARE 계정으로 안전하게 로그인하세요
                </p>
              </div>
              
              <form onSubmit={handleXquareLogin} className="space-y-3 sm:space-y-4">
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
                  className="w-full mt-4 sm:mt-6"
                  size="lg"
                >
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  XQUARE로 로그인
                </Button>
              </form>
            </>
          )}

          {step === 'github' && (
            <>
              <div className="text-center space-y-2">
                <Github className="w-10 h-10 sm:w-12 sm:h-12 text-gray-900 mx-auto" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">GitHub 연동</h2>
                <p className="text-xs sm:text-sm text-gray-600 px-2">
                  GitHub 계정을 연동하여 커밋 기반 채굴을 시작하세요
                </p>
              </div>

              {xquareId && (
                <div className="bg-green-50 p-3 sm:p-4 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-green-800">
                        XQUARE 로그인 완료
                      </p>
                      <p className="text-xs text-green-600 truncate">
                        ID: {xquareId}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-200">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <Github className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-blue-900">
                          GitHub 연동이 필요한 이유
                        </h3>
                      </div>
                    </div>
                    <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-blue-800 ml-6 sm:ml-8">
                      <li>• 커밋 기반 자동 코인 채굴</li>
                      <li>• 실시간 개발 활동 추적</li>
                      <li>• 공정한 채굴량 계산</li>
                    </ul>
                  </div>
                </div>

                <Button
                  onClick={handleShowGithubWarning}
                  isLoading={isLoading}
                  className="w-full"
                  size="lg"
                >
                  <Github className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  GitHub 계정 연동하기
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* 하단 정보 */}
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="flex items-center justify-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>안전한 인증</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>자동 채굴</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 px-4">
            GitHub 계정 연동 시 개인정보는 안전하게 보호됩니다
          </p>
        </div>
      </div>
    </div>

    {/* GitHub 경고 모달 */}
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