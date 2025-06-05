'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

export default function FestivalPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            데마코인 페스티벌
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            데마코인을 활용한 혁신적인 페스티벌 상점 관리 시스템입니다.
            상점을 등록하고 고객들에게 편리한 주문 서비스를 제공해보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="text-center" padding="lg">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg 
                  className="w-8 h-8 text-blue-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                새로운 상점 시작하기
              </h2>
              <p className="text-gray-600 mb-6">
                페스티벌에 참여할 상점을 등록하고 관리자 승인을 받아보세요.
                승인 후 바로 상점 운영을 시작할 수 있습니다.
              </p>
            </div>
            
            <Button
              onClick={() => router.push('/festival/apply')}
              variant="primary"
              size="lg"
              className="w-full"
            >
              입점 신청하기
            </Button>
          </Card>

          <Card className="text-center" padding="lg">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg 
                  className="w-8 h-8 text-green-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                기존 상점 관리하기
              </h2>
              <p className="text-gray-600 mb-6">
                이미 승인받은 상점이 있으시다면 로그인하여 상품을 관리하고
                키오스크 모드를 활용해보세요.
              </p>
            </div>
            
            <Button
              onClick={() => router.push('/festival/login')}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              상점 로그인하기
            </Button>
          </Card>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            어떻게 작동하나요?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">입점 신청</h4>
              <p className="text-sm text-gray-600">
                상점 정보를 입력하고 입점을 신청합니다.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">관리자 승인</h4>
              <p className="text-sm text-gray-600">
                관리자가 검토 후 승인하면 로그인 정보가 전송됩니다.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">상품 등록</h4>
              <p className="text-sm text-gray-600">
                로그인 후 상점의 상품들을 등록하고 관리합니다.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">키오스크 운영</h4>
              <p className="text-sm text-gray-600">
                키오스크 모드로 고객들이 쉽게 주문할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            데마코인 페스티벌 상점 관리 시스템 | 
            문의사항이 있으시면 관리자에게 연락해주세요.
          </p>
        </div>
      </div>
    </div>
  );
} 