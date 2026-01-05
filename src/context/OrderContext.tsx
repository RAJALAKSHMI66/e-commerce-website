import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Order, CartItem, Address, PaymentMethod } from '@/types';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
}

type OrderAction =
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'LOAD_ORDERS'; payload: Order[] }
  | { type: 'SET_LOADING'; payload: boolean };

interface OrderContextType extends OrderState {
  createOrder: (data: CreateOrderData) => Order;
  getOrdersByUserId: (userId: string) => Order[];
  getOrderById: (orderId: string) => Order | undefined;
  getAllOrders: () => Order[];
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

interface CreateOrderData {
  userId: string;
  items: CartItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const STORAGE_KEY = 'shopverse_orders';

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };

    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(o =>
          o.id === action.payload.id ? action.payload : o
        ),
      };

    case 'LOAD_ORDERS':
      return { ...state, orders: action.payload, isLoading: false };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
};

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, {
    orders: [],
    isLoading: true,
  });

  useEffect(() => {
    const savedOrders = localStorage.getItem(STORAGE_KEY);
    if (savedOrders) {
      try {
        const orders = JSON.parse(savedOrders);
        dispatch({ type: 'LOAD_ORDERS', payload: orders });
      } catch {
        dispatch({ type: 'LOAD_ORDERS', payload: [] });
      }
    } else {
      dispatch({ type: 'LOAD_ORDERS', payload: [] });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.orders));
  }, [state.orders]);

  const createOrder = (data: CreateOrderData): Order => {
    let subtotal = 0;
    let discount = 0;

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      const itemTotal = item.product.price * item.quantity;
      subtotal += itemTotal;
      discount += (itemTotal * item.product.discount) / 100;
    }

    const order: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId: data.userId,
      items: data.items,
      totalAmount: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      finalAmount: Math.round((subtotal - discount) * 100) / 100,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_ORDER', payload: order });
    return order;
  };

  const getOrdersByUserId = (userId: string): Order[] => {
    return state.orders.filter(o => o.userId === userId);
  };

  const getOrderById = (orderId: string): Order | undefined => {
    return state.orders.find(o => o.id === orderId);
  };

  const getAllOrders = (): Order[] => {
    return state.orders;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const order = state.orders.find(o => o.id === orderId);
    if (order) {
      dispatch({ type: 'UPDATE_ORDER', payload: { ...order, status } });
    }
  };

  return (
    <OrderContext.Provider
      value={{
        ...state,
        createOrder,
        getOrdersByUserId,
        getOrderById,
        getAllOrders,
        updateOrderStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
