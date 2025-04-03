import AuthGuard from '../services/AuthGuard';
import { useAuth } from '../services/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Bem-vindo, {user?.name}</h1>
            <button 
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Seu Perfil</h2>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Cargo:</strong> {user?.role}</p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}