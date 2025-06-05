'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

export default function StoreLoginPage() {
  const [formData, setFormData] = useState({
    storeId: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/store/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login response:', data);
        localStorage.setItem('storeToken', data.accessToken);
        localStorage.setItem('storeId', formData.storeId);
        console.log('Token saved:', data.accessToken);
        router.push('/festival/store');
      } else {
        const data = await response.json();
        setError(data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">상점 로그인</h1>
          <p className="text-gray-600">관리자로부터 받은 로그인 정보를 입력해주세요</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="상점 ID"
              name="storeId"
              value={formData.storeId}
              onChange={handleChange}
              placeholder="승인 시 받은 상점 ID를 입력해주세요"
              required
            />

            <Input
              label="비밀번호"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="전화번호로 전송된 비밀번호를 입력해주세요"
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
              로그인
            </Button>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            아직 상점이 없으신가요?{' '}
            <button
              onClick={() => router.push('/festival/apply')}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              입점 신청하기
            </button>
          </p>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="font-medium text-blue-900 mb-2">로그인 정보를 받지 못하셨나요?</h3>
          <p className="text-sm text-blue-700">
            입점 신청 후 관리자 승인이 완료되면, 등록하신 전화번호로 로그인 정보가 전송됩니다.
          </p>
        </div>
      </div>
    </div>
  );
} 