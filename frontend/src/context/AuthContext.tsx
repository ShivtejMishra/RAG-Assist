import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Tenant } from '../types';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (tenantName: string, domain: string, email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  getHeaders: () => Record<string, string>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved credentials on startup
    const savedToken = localStorage.getItem('rag_token');
    const savedUser = localStorage.getItem('rag_user');
    const savedTenant = localStorage.getItem('rag_tenant');

    if (savedToken && savedUser && savedTenant) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setTenant(JSON.parse(savedTenant));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed. Please verify credentials.');
      }

      setToken(data.access_token);
      setUser(data.user);
      setTenant(data.tenant);

      localStorage.setItem('rag_token', data.access_token);
      localStorage.setItem('rag_user', JSON.stringify(data.user));
      localStorage.setItem('rag_tenant', JSON.stringify(data.tenant));
    } catch (err: any) {
      setError(err.message || 'An unexpected authentication error occurred.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    tenantName: string,
    domain: string,
    email: string,
    password: string,
    name: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_name: tenantName,
          domain,
          admin_email: email,
          admin_password: password,
          admin_name: name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed.');
      }

      // Automatically log in the user after successful registration
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Tenant registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setTenant(null);
    localStorage.removeItem('rag_token');
    localStorage.removeItem('rag_user');
    localStorage.removeItem('rag_tenant');
  };

  const clearError = () => setError(null);

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('rag_user', JSON.stringify(updated));
      return updated;
    });
  };

  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        token,
        isAuthenticated: !!token,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
        getHeaders,
        updateUser,
      }}
    >
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
