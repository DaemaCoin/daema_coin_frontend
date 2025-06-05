'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Coins, User, LogOut, Settings, QrCode, X, Download } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import QRCode from 'qrcode';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated, walletInfo, userProfile } = useAuthStore();
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');

  const handleLogout = () => {
    logout();
  };

  const handleShowQR = async () => {
    if (!userProfile?.githubId) {
      alert('GitHub ID 정보를 불러올 수 없습니다.');
      return;
    }

    try {
      // githubId를 QR 코드로 생성
      const qrDataURL = await QRCode.toDataURL(userProfile.githubId, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeDataURL(qrDataURL);
      setShowQRModal(true);
    } catch (error) {
      console.error('QR 코드 생성 실패:', error);
      alert('QR 코드 생성에 실패했습니다.');
    }
  };

  const handleCloseQR = () => {
    setShowQRModal(false);
    setQrCodeDataURL('');
  };

  const handleDownloadQR = () => {
    if (!qrCodeDataURL) return;
    
    const link = document.createElement('a');
    link.download = `${userProfile?.githubId}_wallet_qr.png`;
    link.href = qrCodeDataURL;
    link.click();
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Coins className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900">대마코인</span>
            </div>

            {/* 사용자 정보 및 메뉴 */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                {/* 코인 보유량 */}
                <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-gray-900">
                    {walletInfo?.balance?.toLocaleString() || 0} DMC
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShowQR}
                    className="p-1 ml-2 hover:bg-gray-100"
                    title="지갑 QR 코드 보기"
                  >
                    <QrCode className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>

                {/* 사용자 프로필 */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={userProfile?.githubImageUrl || user.avatar || '/default-avatar.svg'}
                      alt={userProfile?.githubId || user.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {userProfile?.githubId || user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      @{userProfile?.githubId || user.githubUsername}
                    </p>
                  </div>
                </div>

                {/* 메뉴 버튼들 */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="p-2"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">로그인해주세요</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* QR 코드 모달 */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-sm w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">내 지갑 QR 코드</h3>
              <button
                onClick={handleCloseQR}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-100">
                {qrCodeDataURL && (
                  <img
                    src={qrCodeDataURL}
                    alt="지갑 QR 코드"
                    className="w-full max-w-[300px] mx-auto"
                  />
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">GitHub ID</p>
                <p className="text-lg font-mono bg-gray-50 px-3 py-2 rounded border">
                  {userProfile?.githubId}
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  이 QR 코드를 스캔하면 결제 시 내 계정으로 결제됩니다.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleDownloadQR}
                  variant="secondary"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  다운로드
                </Button>
                <Button
                  onClick={handleCloseQR}
                  variant="primary"
                  className="flex-1"
                >
                  닫기
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default Header; 