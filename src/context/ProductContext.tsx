import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Product, Category } from '@/types';
import { mockProducts } from '@/data/products';

interface ProductState {
  products: Product[];
  filteredProducts: Product[];
  selectedCategory: Category | 'all';
  searchQuery: string;
  sortBy: SortOption;
  isLoading: boolean;
}

type SortOption = 'default' | 'price-low' | 'price-high' | 'rating' | 'popularity';

type ProductAction =
  | { type: 'SET_CATEGORY'; payload: Category | 'all' }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_SORT'; payload: SortOption }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_PRODUCTS'; payload: Product[] };

interface ProductContextType extends ProductState {
  setCategory: (category: Category | 'all') => void;
  setSearch: (query: string) => void;
  setSortBy: (sort: SortOption) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  getProductById: (productId: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const STORAGE_KEY = 'shopverse_products';

const filterAndSortProducts = (
  products: Product[],
  category: Category | 'all',
  searchQuery: string,
  sortBy: SortOption
): Product[] => {
  let result = [...products];

  // Filter by category
  if (category !== 'all') {
    result = result.filter(p => p.category === category);
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
    );
  }

  // Sort
  switch (sortBy) {
    case 'price-low':
      result.sort((a, b) => {
        const priceA = a.price * (1 - a.discount / 100);
        const priceB = b.price * (1 - b.discount / 100);
        return priceA - priceB;
      });
      break;
    case 'price-high':
      result.sort((a, b) => {
        const priceA = a.price * (1 - a.discount / 100);
        const priceB = b.price * (1 - b.discount / 100);
        return priceB - priceA;
      });
      break;
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'popularity':
      result.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    default:
      // Keep original order
      break;
  }

  return result;
};

const productReducer = (state: ProductState, action: ProductAction): ProductState => {
  switch (action.type) {
    case 'SET_CATEGORY': {
      const filteredProducts = filterAndSortProducts(
        state.products,
        action.payload,
        state.searchQuery,
        state.sortBy
      );
      return { ...state, selectedCategory: action.payload, filteredProducts };
    }

    case 'SET_SEARCH': {
      const filteredProducts = filterAndSortProducts(
        state.products,
        state.selectedCategory,
        action.payload,
        state.sortBy
      );
      return { ...state, searchQuery: action.payload, filteredProducts };
    }

    case 'SET_SORT': {
      const filteredProducts = filterAndSortProducts(
        state.products,
        state.selectedCategory,
        state.searchQuery,
        action.payload
      );
      return { ...state, sortBy: action.payload, filteredProducts };
    }

    case 'ADD_PRODUCT': {
      const newProducts = [...state.products, action.payload];
      const filteredProducts = filterAndSortProducts(
        newProducts,
        state.selectedCategory,
        state.searchQuery,
        state.sortBy
      );
      return { ...state, products: newProducts, filteredProducts };
    }

    case 'UPDATE_PRODUCT': {
      const newProducts = state.products.map(p =>
        p.id === action.payload.id ? action.payload : p
      );
      const filteredProducts = filterAndSortProducts(
        newProducts,
        state.selectedCategory,
        state.searchQuery,
        state.sortBy
      );
      return { ...state, products: newProducts, filteredProducts };
    }

    case 'DELETE_PRODUCT': {
      const newProducts = state.products.filter(p => p.id !== action.payload);
      const filteredProducts = filterAndSortProducts(
        newProducts,
        state.selectedCategory,
        state.searchQuery,
        state.sortBy
      );
      return { ...state, products: newProducts, filteredProducts };
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOAD_PRODUCTS': {
      const filteredProducts = filterAndSortProducts(
        action.payload,
        state.selectedCategory,
        state.searchQuery,
        state.sortBy
      );
      return { ...state, products: action.payload, filteredProducts, isLoading: false };
    }

    default:
      return state;
  }
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, {
    products: [],
    filteredProducts: [],
    selectedCategory: 'all',
    searchQuery: '',
    sortBy: 'default',
    isLoading: true,
  });

  useEffect(() => {
    const savedProducts = localStorage.getItem(STORAGE_KEY);
    if (savedProducts) {
      try {
        const products = JSON.parse(savedProducts);
        dispatch({ type: 'LOAD_PRODUCTS', payload: products });
      } catch {
        dispatch({ type: 'LOAD_PRODUCTS', payload: mockProducts });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockProducts));
      }
    } else {
      dispatch({ type: 'LOAD_PRODUCTS', payload: mockProducts });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockProducts));
    }
  }, []);

  useEffect(() => {
    if (state.products.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.products));
    }
  }, [state.products]);

  const setCategory = (category: Category | 'all') => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  };

  const setSearch = (query: string) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
  };

  const setSortBy = (sort: SortOption) => {
    dispatch({ type: 'SET_SORT', payload: sort });
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
  };

  const updateProduct = (product: Product) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: product });
  };

  const deleteProduct = (productId: string) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: productId });
  };

  const getProductById = (productId: string): Product | undefined => {
    return state.products.find(p => p.id === productId);
  };

  return (
    <ProductContext.Provider
      value={{
        ...state,
        setCategory,
        setSearch,
        setSortBy,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
