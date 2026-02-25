import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { useToast } from '../hooks/useToast';
import { staffApi } from '../api/staff';
import type { StaffMember } from '../types';
import { Users, Plus, Key, UserX, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState<'info' | 'verify'>('info');
  const { success, error: showError } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'STAFF' as 'SUPER_ADMIN' | 'STAFF',
  });

  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const data = await staffApi.getAll();
      setStaff(data);
    } catch (err) {
      showError('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await staffApi.create(formData);
      setStep('verify');
      success('Verification code sent to email');
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to start creation');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await staffApi.verifyEmail(formData.email, verificationCode);
      const result = await staffApi.completeRegistration(formData);
      if (result.devCredentials) {
        success(`Staff created! Username: ${result.devCredentials.username} | Password: ${result.devCredentials.password}`);
      } else {
        success('Staff created successfully! Credentials sent to email.');
      }
      loadStaff();
      handleCancel();
    } catch (err: any) {
      showError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await staffApi.resendCode(formData.email);
      success('Verification code resent');
    } catch (err) {
      showError('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (staffId: number) => {
    if (!confirm('Reset password for this staff member? New password will be sent to their email.')) {
      return;
    }

    setLoading(true);
    try {
      await staffApi.resetPassword(staffId);
      success('Password reset successfully! New password sent to email.');
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleSetStatus = async (member: StaffMember) => {
    const isDeactivating = member.status === 'ACTIVE';
    if (!confirm(
      isDeactivating
        ? `Deactivate ${member.firstName} ${member.lastName}? They will be logged out immediately and cannot log in.`
        : `Reactivate ${member.firstName} ${member.lastName}?`
    )) return;

    setLoading(true);
    try {
      const updated = await staffApi.setStatus(member.id, isDeactivating ? 'DISABLED' : 'ACTIVE');
      setStaff((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      success(isDeactivating ? 'Staff deactivated successfully.' : 'Staff reactivated successfully.');
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setStep('info');
    setFormData({ firstName: '', lastName: '', email: '', role: 'STAFF' });
    setVerificationCode('');
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Staff</span>
            </button>
          )}
        </div>

        {showForm && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Staff</h2>

            {step === 'info' ? (
              <form onSubmit={handleStartCreation} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="input"
                  >
                    <option value="STAFF">Staff</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>

                <div className="flex space-x-3">
                  <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? 'Sending...' : 'Send Verification Code'}
                  </button>
                  <button type="button" onClick={handleCancel} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <p className="text-gray-600">Enter the verification code sent to {formData.email}</p>

                {import.meta.env.VITE_TEST_MODE === 'true' && (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-2 text-sm text-yellow-800">
                    Test mode: use code <span className="font-bold tracking-widest">111111</span>
                  </div>
                )}

                <div>
                  <label className="label">Verification Code</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button type="submit" disabled={loading || verificationCode.length !== 6} className="btn btn-primary flex-1">
                    {loading ? 'Verifying...' : 'Complete Registration'}
                  </button>
                  <button type="button" onClick={handleResendCode} disabled={loading} className="btn btn-secondary">
                    Resend Code
                  </button>
                  <button type="button" onClick={handleCancel} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">All Staff Members</h2>

          {loading && staff.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No staff members yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900">{member.username}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          member.role === 'SUPER_ADMIN'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {member.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Staff'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          member.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-4">
                          <button
                            onClick={() => handleResetPassword(member.id)}
                            disabled={loading || member.status === 'DISABLED'}
                            className="inline-flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Key className="w-4 h-4" />
                            <span>Reset Password</span>
                          </button>
                          {user?.id !== member.id && (
                            <button
                              onClick={() => handleSetStatus(member)}
                              disabled={loading}
                              className={`inline-flex items-center space-x-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed ${
                                member.status === 'ACTIVE'
                                  ? 'text-gray-500 hover:text-gray-800'
                                  : 'text-green-600 hover:text-green-800'
                              }`}
                            >
                              {member.status === 'ACTIVE' ? (
                                <><UserX className="w-4 h-4" /><span>Deactivate</span></>
                              ) : (
                                <><UserCheck className="w-4 h-4" /><span>Activate</span></>
                              )}
                            </button>
                          )}
                        </div>
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
