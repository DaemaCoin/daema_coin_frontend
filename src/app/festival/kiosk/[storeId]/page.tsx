'use client';

import React, { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useParams } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function KioskPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderResult, setOrderResult] = useState<string>('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [storeId]);

  useEffect(() => {
    if (showQRScanner) {
      startQRScanner();
    }
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [showQRScanner]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('storeToken');
      
      if (!token) {
        console.error('Store token not found');
        return;
      }

      const response = await fetch('/api/store/my-products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Failed to fetch products:', response.status);
      }
    } catch (error) {
      console.error('상품 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startQRScanner = () => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      config,
      false
    );

    scanner.render(
      async (decodedText: string) => {
        console.log('QR 스캔 결과:', decodedText);
        await handleQRScanSuccess(decodedText);
        scanner.clear();
      },
      (error: any) => {
        console.log('QR 스캔 오류:', error);
      }
    );

    scannerRef.current = scanner;
  };

  const handleQRScanSuccess = async (qrData: string) => {
    setIsProcessingOrder(true);
    
    try {
      // QR 코드에서 사용자 ID 추출
      // QR 코드가 JSON 형태라면 파싱, 단순 텍스트라면 그대로 사용자 ID로 처리
      let userId: string;
      
      try {
        const parsedData = JSON.parse(qrData);
        userId = parsedData.userId || parsedData.id || qrData;
      } catch {
        // JSON이 아닌 경우 텍스트 그대로 사용자 ID로 처리
        userId = qrData.trim();
      }

      console.log('추출된 사용자 ID:', userId);

      // 주문 데이터 준비
      const orderItems = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      // 실제 주문 API 호출
      const response = await fetch(`/api/store/${storeId}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          orderItems: orderItems
        }),
      });

      if (response.ok) {
        const orderData = await response.json();
        setOrderResult('success');
        setCart([]); // 장바구니 초기화
        
        // 3초 후 스캐너 화면 닫기
        setTimeout(() => {
          setShowQRScanner(false);
          setOrderResult('');
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('주문 생성 실패:', errorData);
        setOrderResult('error');
        
        // 3초 후 에러 메시지 초기화
        setTimeout(() => {
          setOrderResult('');
        }, 3000);
      }
    } catch (error) {
      console.error('주문 처리 오류:', error);
      setOrderResult('error');
      
      setTimeout(() => {
        setOrderResult('');
      }, 3000);
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === productId);
      
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevCart.filter(item => item.product.id !== productId);
      }
    });
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleStartPayment = () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }
    setShowQRScanner(true);
  };

  const handleCancelPayment = () => {
    setShowQRScanner(false);
    setOrderResult('');
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">상품을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (showQRScanner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-lg w-full mx-4 text-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">QR 코드 스캔</h1>
            <p className="text-gray-600">고객의 QR 코드를 카메라에 비춰주세요</p>
          </div>
          
          {!isProcessingOrder && !orderResult && (
            <div id="qr-reader" className="mb-6"></div>
          )}

          {isProcessingOrder && (
            <div className="py-12">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">주문을 처리하고 있습니다...</p>
            </div>
          )}

          {orderResult === 'success' && (
            <div className="py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-600 mb-2">주문 완료!</h3>
              <p className="text-gray-600">결제가 성공적으로 처리되었습니다.</p>
            </div>
          )}

          {orderResult === 'error' && (
            <div className="py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">주문 실패</h3>
              <p className="text-gray-600">결제 처리 중 오류가 발생했습니다.</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>총 결제 금액</span>
                <span className="text-blue-600">
                  {getTotalAmount().toLocaleString()} DMC
                </span>
              </div>
              
              <div className="mt-3 text-left">
                <h4 className="font-medium mb-2">주문 내역</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.product.name} x {item.quantity}</span>
                      <span>{(item.product.price * item.quantity).toLocaleString()} DMC</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {!isProcessingOrder && !orderResult && (
              <Button
                onClick={handleCancelPayment}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                취소
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900">키오스크 주문</h1>
          <p className="text-gray-600">원하는 상품을 선택해주세요</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 상품 목록 */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">상품 메뉴</h2>
            
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">등록된 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="relative cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-95"
                    onClick={() => addToCart(product)}
                  >
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xl font-bold text-blue-600">
                        {product.price.toLocaleString()} DMC
                      </p>
                      <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold">
                        +
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* 장바구니 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-6">주문 내역</h2>
                
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 4.22M7 13l4.28 2.12M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
                      </svg>
                    </div>
                    <p className="text-gray-500">
                      상품을 선택해주세요
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                            <p className="text-sm text-gray-600">
                              {item.product.price.toLocaleString()} DMC
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors"
                            >
                              -
                            </button>
                            <span className="min-w-[30px] text-center font-bold text-lg">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => addToCart(item.product)}
                              className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-6 mb-6">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>총 금액</span>
                        <span className="text-blue-600">
                          {getTotalAmount().toLocaleString()} DMC
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleStartPayment}
                      variant="primary"
                      size="lg"
                      className="w-full text-lg py-6"
                    >
                      QR 스캔으로 결제받기
                    </Button>
                  </>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 