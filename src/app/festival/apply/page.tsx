'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

export default function StoreApplyPage() {
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    storeImage: '',
    phoneNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/store/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('입점 신청이 완료되었습니다. 관리자 승인을 기다려주세요.');
        router.push('/festival');
      } else {
        const data = await response.json();
        setError(data.message || '입점 신청에 실패했습니다.');
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">상점 입점 신청</h1>
          <p className="text-gray-600">데마코인 페스티벌에 참여할 상점을 등록해보세요</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="상점 이름"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              placeholder="상점 이름을 입력해주세요"
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                상점 설명
              </label>
              <textarea
                name="storeDescription"
                value={formData.storeDescription}
                onChange={handleChange}
                placeholder="상점에 대한 간단한 설명을 입력해주세요"
                rows={4}
                className="toss-input min-h-[120px] resize-none"
                required
              />
            </div>

            <Input
              label="상점 이미지 URL"
              name="storeImage"
              value={formData.storeImage}
              onChange={handleChange}
              placeholder="https://example.com/store-image.jpg"
              type="url"
            />

            <Input
              label="전화번호"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="010-1234-5678"
              type="tel"
              required
            />

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              입점 신청하기
            </Button>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            이미 상점을 운영 중이신가요?{' '}
            <button
              onClick={() => router.push('/festival/login')}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              상점 로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  );
} 