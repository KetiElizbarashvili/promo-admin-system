import { useAuth } from '../../hooks/useAuth';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
      <div className="px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            
            <Link to="/" className="flex items-center space-x-3">
              <span className="text-lg sm:text-xl font-bold text-black truncate">
                KitKat Promo Admin
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <UserIcon className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 font-medium hidden md:inline">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Staff'}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
