import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { WishlistItem, Product } from '@/types';

interface WishlistState {
  items: WishlistItem[];
  count: number;
}

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'LOAD_WISHLIST'; payload: WishlistItem[] };

interface WishlistContextType extends WishlistState {
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'shopverse_wishlist';

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  let newItems: WishlistItem[];

  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.some(item => item.product.id === action.payload.id);
      if (exists) return state;
      
      newItems = [
        ...state.items,
        { product: action.payload, addedAt: new Date().toISOString() },
      ];
      break;
    }

    case 'REMOVE_ITEM':
      newItems = state.items.filter(item => item.product.id !== action.payload);
      break;

    case 'CLEAR_WISHLIST':
      newItems = [];
      break;

    case 'LOAD_WISHLIST':
      newItems = action.payload;
      break;

    default:
      return state;
  }

  return { items: newItems, count: newItems.length };
};

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, {
    items: [],
    count: 0,
  });

  useEffect(() => {
    const savedWishlist = localStorage.getItem(STORAGE_KEY);
    if (savedWishlist) {
      try {
        const items = JSON.parse(savedWishlist);
        dispatch({ type: 'LOAD_WISHLIST', payload: items });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
  };

  const isInWishlist = (productId: string): boolean => {
    return state.items.some(item => item.product.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        clearWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
