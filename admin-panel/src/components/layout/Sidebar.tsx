import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Home,
  UserPlus,
  Users,
  Gift,
  BarChart3,
  FileText,
  ChevronsLeft,
  ChevronsRight,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export function Sidebar({ isMobileMenuOpen, onCloseMobileMenu }: SidebarProps) {
  const { isSuperAdmin, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const links = [
    { to: '/', label: 'Dashboard', icon: Home, end: true },
    { to: '/participants/register', label: 'Register Participant', icon: UserPlus },
    { to: '/participants', label: 'Participants', icon: Users, end: true },
    { to: '/prizes', label: 'Prizes', icon: Gift },
    { to: '/leaderboard', label: 'Leaderboard', icon: BarChart3 },
    ...(isSuperAdmin
      ? [
          { to: '/staff', label: 'Staff Management', icon: Users },
          { to: '/logs', label: 'Activity Logs', icon: FileText },
        ]
      : []),
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside 
        className={`hidden lg:block bg-white shadow-sm border-r border-gray-200 min-h-screen transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="relative">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:shadow-md hover:bg-red-50 hover:border-red-200 transition-all z-10 group"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronsRight className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
            ) : (
              <ChevronsLeft className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
            )}
          </button>

          <nav className="p-4 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-red-50 text-red-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                  title={isCollapsed ? link.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{link.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <aside 
        className={`lg:hidden fixed top-0 left-0 h-full bg-white shadow-xl z-40 w-72 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-700 font-bold text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-600">
                  {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Staff'}
                </p>
              </div>
            </div>
            <button
              onClick={onCloseMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={onCloseMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-red-50 text-red-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
