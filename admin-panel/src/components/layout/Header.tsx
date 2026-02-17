import { useAuth } from '../../hooks/useAuth';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <span className="text-xl font-bold text-black">KitKat Promo Admin</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <UserIcon className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 font-medium">{user?.firstName} {user?.lastName}</span>
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Staff'}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
