
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../services/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  return user ? <>{children}</> : null;
}