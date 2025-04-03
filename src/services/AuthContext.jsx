// src/services/AuthContext.js
'use client';  // Certifique-se de marcar como 'use client' para funcionar no cliente

import { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';  // Use 'next/navigation'
import api from './api';  // Importe sua API ou métodos de autenticação

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);  // 'user' começa como null
  const router = useRouter();

  // Função de login
  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      const userData = response.data;  // Supondo que a API retorne os dados do usuário
      setUser(userData);  // Armazena os dados do usuário no estado
      router.push('/dashboard');  // Redireciona para o dashboard após login
    } catch (error) {
      throw new Error('Falha no login');
    }
  };

  // Função de logout
  const logout = () => {
    setUser(null);  // Remove o usuário autenticado
    router.push('/login');  // Redireciona para a página de login
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para acessar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
