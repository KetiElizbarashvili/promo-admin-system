import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Home,
  UserPlus,
  Users,
  Gift,
  BarChart3,
  FileText,
} from 'lucide-react';

export function Sidebar() {
  const { isSuperAdmin } = useAuth();

  const links = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/participants/register', label: 'Register Participant', icon: UserPlus },
    { to: '/participants', label: 'Participants', icon: Users },
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
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-red-50 text-red-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
