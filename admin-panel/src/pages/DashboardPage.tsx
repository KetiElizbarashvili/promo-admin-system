import { Layout } from '../components/layout/Layout';
import { Users, UserPlus, Trophy, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import kitkatImage from '../assets/kitkat.svg';

export function DashboardPage() {
  const cards = [
    {
      title: 'Register Participant',
      description: 'Register new participants with OTP verification',
      icon: UserPlus,
      link: '/participants/register',
      color: 'bg-blue-500',
    },
    {
      title: 'Manage Participants',
      description: 'Search, add points, and manage participants',
      icon: Users,
      link: '/participants',
      color: 'bg-green-500',
    },
    {
      title: 'Prizes',
      description: 'Manage prizes and redemptions',
      icon: Gift,
      link: '/prizes',
      color: 'bg-purple-500',
    },
    {
      title: 'Leaderboard',
      description: 'View participant rankings',
      icon: Trophy,
      link: '/leaderboard',
      color: 'bg-yellow-500',
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8 flex items-center space-x-3 sm:space-x-4">
          <img src={kitkatImage} alt="KitKat" className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover shadow-sm flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600">Welcome to the KitKat Promo Admin System</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.link}
                to={card.link}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className={`${card.color} w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{card.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{card.description}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
            <div className="space-y-2 sm:space-y-3">
              <Link to="/participants/register" className="block p-2.5 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-sm sm:text-base font-medium text-gray-900">Register New Participant</div>
                <div className="text-xs sm:text-sm text-gray-600">Start multi-step registration process</div>
              </Link>
              <Link to="/participants" className="block p-2.5 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-sm sm:text-base font-medium text-gray-900">Add Points</div>
                <div className="text-xs sm:text-sm text-gray-600">Search participant and add points</div>
              </Link>
              <Link to="/prizes" className="block p-2.5 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-sm sm:text-base font-medium text-gray-900">Redeem Prize</div>
                <div className="text-xs sm:text-sm text-gray-600">Help participant redeem rewards</div>
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">System Info</h2>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-green-50 rounded-lg">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Backend Status</span>
                <span className="text-xs sm:text-sm font-semibold text-green-700">Online</span>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-blue-50 rounded-lg">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Database</span>
                <span className="text-xs sm:text-sm font-semibold text-blue-700">Connected</span>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-purple-50 rounded-lg">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Redis Cache</span>
                <span className="text-xs sm:text-sm font-semibold text-purple-700">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
