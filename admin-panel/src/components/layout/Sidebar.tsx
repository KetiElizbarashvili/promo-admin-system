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
} from 'lucide-react';
import { useState } from 'react';

export function Sidebar() {
  const { isSuperAdmin } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <aside 
      className={`bg-white shadow-sm border-r border-gray-200 min-h-screen transition-all duration-300 ${
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
  );
}
