import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  token_no: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    token_no?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (tokenNo: string, password: string) => Promise<void>;
  signUp: (tokenNo: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => void;
  getUserFullName: () => string;
  getTokenNo: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const data = await api.get('/auth/me', storedToken);
          if (data.user) {
            setUser(data.user);
            setToken(storedToken);
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signIn = async (tokenNo: string, password: string) => {
    try {
      const data = await api.post('/auth/signin', { token_no: tokenNo, password });
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
      }
    } catch (error: any) {
      console.error('Sign in failed:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signUp = async (
    tokenNo: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      const data = await api.post('/auth/signup', {
        token_no: tokenNo,
        password,
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`
      });

      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign up');
    }
  };


  const signOut = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const getUserFullName = (): string => {
    if (!user) return '';

    // Try to get from user metadata
    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    const fullName = user.user_metadata?.full_name || '';

    // Return in order of preference
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (fullName) {
      return fullName;
    } else {
      return getTokenNo() || 'User';
    }
  };

  const getTokenNo = (): string => {
    if (!user) return '';
    return user.token_no || '';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        getUserFullName,
        getTokenNo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
