import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { adminApi } from '../api/admin';
import type { TransactionLog } from '../types';
import { FileText, Filter } from 'lucide-react';

export function ActivityLogsPage() {
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async (overrideFilters?: typeof filters) => {
    const active = overrideFilters ?? filters;
    setLoading(true);
    try {
      const data = await adminApi.getLogs({
        type: active.type || undefined,
        startDate: active.startDate || undefined,
        endDate: active.endDate || undefined,
        limit: 100,
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    loadLogs();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const cleared = { type: '', startDate: '', endDate: '' };
    setFilters(cleared);
    loadLogs(cleared);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      REGISTER: 'bg-blue-100 text-blue-800',
      ADD_POINTS: 'bg-green-100 text-green-800',
      REDEEM: 'bg-purple-100 text-purple-800',
      STAFF_CREATE: 'bg-yellow-100 text-yellow-800',
      RESET_PASSWORD: 'bg-orange-100 text-orange-800',
      LOCK_PARTICIPANT: 'bg-red-100 text-red-800',
      UNLOCK_PARTICIPANT: 'bg-green-100 text-green-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
          <div className="flex space-x-3">
            <button onClick={() => setShowFilters(!showFilters)} className="btn btn-secondary flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
            <button onClick={() => loadLogs()} className="btn btn-secondary text-sm">
              Refresh
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Transaction Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="input"
                >
                  <option value="">All Types</option>
                  <option value="REGISTER">Register</option>
                  <option value="ADD_POINTS">Add Points</option>
                  <option value="REDEEM">Redeem</option>
                  <option value="STAFF_CREATE">Staff Create</option>
                  <option value="RESET_PASSWORD">Reset Password</option>
                  <option value="LOCK_PARTICIPANT">Lock Participant</option>
                  <option value="UNLOCK_PARTICIPANT">Unlock Participant</option>
                </select>
              </div>
              <div>
                <label className="label">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-4">
              <button onClick={handleApplyFilters} className="btn btn-primary">
                Apply Filters
              </button>
              <button onClick={handleClearFilters} className="btn btn-secondary">
                Clear Filters
              </button>
            </div>
          </div>
        )}

        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No activity logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date/Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(log.type)}`}>
                          {log.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.participantName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.staffName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {log.pointsChange !== null && (
                          <span className={`text-sm font-semibold ${
                            log.pointsChange > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {log.pointsChange > 0 ? '+' : ''}{log.pointsChange}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {log.note || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
