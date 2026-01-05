import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Address } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> }
  | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, isLoading: false };
    case 'UPDATE_PROFILE':
      return state.user ? { ...state, user: { ...state.user, ...action.payload } } : state;
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const STORAGE_KEY = 'shopverse_user';
const USERS_KEY = 'shopverse_users';

const defaultAddress: Address = {
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'USA',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'LOGIN', payload: user });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const getUsers = (): User[] => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: 'No account found with this email' };
    }

    // In a real app, you'd hash and compare passwords
    const storedPassword = localStorage.getItem(`password_${user.id}`);
    if (storedPassword !== password) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: 'Incorrect password' };
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: user });
    return { success: true };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = getUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());

    if (existingUser) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: 'An account with this email already exists' };
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: defaultAddress,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);
    localStorage.setItem(`password_${newUser.id}`, data.password);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

    dispatch({ type: 'LOGIN', payload: newUser });
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = (data: Partial<User>) => {
    if (!state.user) return;

    const updatedUser = { ...state.user, ...data };
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === state.user!.id);
    
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      saveUsers(users);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    dispatch({ type: 'UPDATE_PROFILE', payload: data });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
