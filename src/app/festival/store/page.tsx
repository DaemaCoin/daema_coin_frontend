'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
}

interface Order {
  id: number;
  createdAt: string;
  status: string;
  totalAmount: number;
  orderItems: {
    product: Product;
    quantity: number;
  }[];
}

export default function StoreDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [storeId, setStoreId] = useState<string>('');
  const router = useRouter();

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    image: '',
    price: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('storeToken');
    const storedStoreId = localStorage.getItem('storeId');
    console.log('Dashboard useEffect - token:', token, 'storeId:', storedStoreId);
    
    if (!token || !storedStoreId) {
      console.log('Missing token or storeId, redirecting to login');
      router.push('/festival/login');
      return;
    }
    
    setStoreId(storedStoreId);
    fetchProducts();
    fetchOrders();
  }, [router]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('storeToken');
      console.log('Fetching products with token:', token);
      
      const response = await fetch('/api/store/my-products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Products response status:', response.status);
      
      if (response.status === 403) {
        localStorage.removeItem('storeToken');
        localStorage.removeItem('storeId');
        router.push('/festival/login');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('Products data:', data);
        setProducts(data);
      } else {
        const errorData = await response.json();
        console.error('Products fetch error:', errorData);
      }
    } catch (error) {
      console.error('상품 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('storeToken');
      console.log('Fetching orders with token:', token);
      
      const response = await fetch('/api/store/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Orders response status:', response.status);
      
      if (response.status === 403) {
        localStorage.removeItem('storeToken');
        localStorage.removeItem('storeId');
        router.push('/festival/login');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('Orders data:', data);
        setOrders(data);
      } else {
        const errorData = await response.json();
        console.error('Orders fetch error:', errorData);
      }
    } catch (error) {
      console.error('주문 조회 실패:', error);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('storeToken');
      console.log('Adding product with token:', token);
      
      const response = await fetch('/api/store/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProduct,
          price: parseInt(newProduct.price)
        }),
      });

      console.log('Add product response status:', response.status);

      if (response.status === 403) {
        localStorage.removeItem('storeToken');
        localStorage.removeItem('storeId');
        router.push('/festival/login');
        return;
      }

      if (response.ok) {
        console.log('Product added successfully');
        setNewProduct({ name: '', description: '', image: '', price: '' });
        setShowAddProduct(false);
        fetchProducts();
      } else {
        const errorData = await response.json();
        console.error('Add product error:', errorData);
      }
    } catch (error) {
      console.error('상품 추가 실패:', error);
    }
  };

  const handleCompleteOrder = async (orderId: number) => {
    try {
      const token = localStorage.getItem('storeToken');
      console.log('Completing order with token:', token, 'orderId:', orderId);
      
      const response = await fetch(`/api/store/orders/${orderId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Complete order response status:', response.status);

      if (response.status === 403) {
        localStorage.removeItem('storeToken');
        localStorage.removeItem('storeId');
        router.push('/festival/login');
        return;
      }

      if (response.ok) {
        console.log('Order completed successfully');
        fetchOrders();
      } else {
        const errorData = await response.json();
        console.error('Complete order error:', errorData);
      }
    } catch (error) {
      console.error('주문 완료 실패:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('storeToken');
    localStorage.removeItem('storeId');
    router.push('/festival/login');
  };

  const handleKioskMode = () => {
    router.push(`/festival/kiosk/${storeId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">상점 관리</h1>
          <div className="flex gap-3">
            <Button onClick={handleKioskMode} variant="primary">
              키오스크 모드
            </Button>
            <Button onClick={handleLogout} variant="ghost">
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'products'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            상품 관리
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            주문 내역
          </button>
        </div>

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">상품 목록</h2>
              <Button onClick={() => setShowAddProduct(true)}>
                상품 추가
              </Button>
            </div>

            {showAddProduct && (
              <Card className="mb-6">
                <h3 className="text-lg font-semibold mb-4">새 상품 추가</h3>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <Input
                    label="상품명"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      상품 설명
                    </label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="toss-input min-h-[100px] resize-none"
                      required
                    />
                  </div>
                  <Input
                    label="이미지 URL"
                    type="url"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  />
                  <Input
                    label="가격 (DMC)"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    required
                  />
                  <div className="flex gap-3">
                    <Button type="submit" variant="primary">저장</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowAddProduct(false)}>
                      취소
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="relative">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                  <p className="text-lg font-bold text-blue-600">
                    {product.price.toLocaleString()} DMC
                  </p>
                </Card>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">등록된 상품이 없습니다.</p>
                <Button onClick={() => setShowAddProduct(true)} className="mt-4">
                  첫 상품 추가하기
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">주문 내역</h2>
            
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">주문 #{order.id}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{order.totalAmount.toLocaleString()} DMC</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status === 'COMPLETED' ? '완료' : '대기중'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.product.name} x {item.quantity}</span>
                        <span>{(item.product.price * item.quantity).toLocaleString()} DMC</span>
                      </div>
                    ))}
                  </div>

                  {order.status !== 'COMPLETED' && (
                    <Button
                      onClick={() => handleCompleteOrder(order.id)}
                      variant="primary"
                      size="sm"
                    >
                      주문 완료 처리
                    </Button>
                  )}
                </Card>
              ))}
            </div>

            {orders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">주문 내역이 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 