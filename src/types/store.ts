export interface Store {
  id: string;
  storeName: string;
  storeDescription: string;
  storeImage?: string;
  phoneNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface StoreApplication {
  id: number;
  storeName: string;
  storeDescription: string;
  storeImage?: string;
  phoneNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  image?: string;
  price: number;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

export interface Order {
  id: number;
  userId: string;
  storeId: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// API Request/Response Types
export interface StoreApplyRequest {
  storeName: string;
  storeDescription: string;
  storeImage?: string;
  phoneNumber: string;
}

export interface StoreLoginRequest {
  storeId: string;
  password: string;
}

export interface StoreLoginResponse {
  token: string;
  store: Store;
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  image?: string;
  price: number;
}

export interface OrderCreateRequest {
  userId: string;
  orderItems: {
    productId: number;
    quantity: number;
  }[];
}

export interface ApiError {
  message: string;
  code?: string;
} 