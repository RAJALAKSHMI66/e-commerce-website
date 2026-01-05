export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  role: 'user' | 'seller' | 'admin';
  profileImage?: string;
  createdAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  discount: number;
  stock: number;
  description: string;
  rating: number;
  reviewCount: number;
  images: string[];
  features: string[];
  brand: string;
  createdAt: string;
}

export type Category = 
  | 'electronics' 
  | 'fashion' 
  | 'grocery' 
  | 'furniture' 
  | 'books' 
  | 'custom';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
}

export type PaymentMethod = 'cod' | 'upi' | 'card';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface CategoryInfo {
  id: Category;
  name: string;
  icon: string;
  description: string;
}
