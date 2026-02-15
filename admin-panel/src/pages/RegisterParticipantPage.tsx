import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { useToast } from '../hooks/useToast';
import { participantApi } from '../api/participant';
import { CheckCircle, Phone, Mail, UserCheck } from 'lucide-react';

type Step = 'info' | 'phone' | 'email' | 'complete';

export function RegisterParticipantPage() {
  const [step, setStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    govId: '',
    phone: '',
    email: '',
  });

  const [sessionId, setSessionId] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [registeredParticipant, setRegisteredParticipant] = useState<any>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const startCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStartRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await participantApi.startRegistration(formData);
      setSessionId(response.sessionId);
      setStep('phone');
      success('Phone verification code sent!');
      startCooldown();
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to start registration');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await participantApi.verifyPhone(sessionId, phoneCode);
      setStep('email');
      success('Phone verified! Email verification code sent.');
      setPhoneCode('');
      startCooldown();
    } catch (err: any) {
      showError(err.response?.data?.error || 'Invalid phone code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await participantApi.verifyEmail(sessionId, emailCode);
      const result = await participantApi.completeRegistration(sessionId, formData);
      setRegisteredParticipant(result.participant);
      setStep('complete');
      success('Participant registered successfully!');
    } catch (err: any) {
      showError(err.response?.data?.error || 'Invalid email code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (type: 'phone' | 'email') => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await participantApi.resendOTP(sessionId, type);
      success(`${type === 'phone' ? 'Phone' : 'Email'} code resent!`);
      startCooldown();
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('info');
    setFormData({ firstName: '', lastName: '', govId: '', phone: '', email: '' });
    setSessionId('');
    setPhoneCode('');
    setEmailCode('');
    setRegisteredParticipant(null);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Register New Participant</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { key: 'info', label: 'Info', icon: UserCheck },
              { key: 'phone', label: 'Phone', icon: Phone },
              { key: 'email', label: 'Email', icon: Mail },
              { key: 'complete', label: 'Complete', icon: CheckCircle },
            ].map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.key;
              const isCompleted = ['info', 'phone', 'email'].indexOf(step) > idx;
              return (
                <div key={s.key} className="flex items-center flex-1">
                  <div className={`flex items-center space-x-2 ${isActive ? 'text-red-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-red-100' : isCompleted ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium hidden sm:block">{s.label}</span>
                  </div>
                  {idx < 3 && (
                    <div className={`flex-1 h-1 mx-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          {/* Step 1: Participant Info */}
          {step === 'info' && (
            <form onSubmit={handleStartRegistration} className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Participant Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="label">Government ID</label>
                <input
                  type="text"
                  value={formData.govId}
                  onChange={(e) => setFormData({ ...formData, govId: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                  placeholder="995555123456"
                  required
                />
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

              <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? 'Sending...' : 'Send Phone Verification Code'}
              </button>
            </form>
          )}

          {/* Step 2: Phone Verification */}
          {step === 'phone' && (
            <form onSubmit={handleVerifyPhone} className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Phone Verification</h2>
              <p className="text-gray-600">Enter the 6-digit code sent to {formData.phone}</p>

              <div>
                <label className="label">Verification Code</label>
                <input
                  type="text"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button type="submit" disabled={loading || phoneCode.length !== 6} className="btn btn-primary flex-1">
                  {loading ? 'Verifying...' : 'Verify Phone'}
                </button>
                <button
                  type="button"
                  onClick={() => handleResendOTP('phone')}
                  disabled={loading || resendCooldown > 0}
                  className="btn btn-secondary"
                >
                  {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Email Verification */}
          {step === 'email' && (
            <form onSubmit={handleVerifyEmail} className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Email Verification</h2>
              <p className="text-gray-600">Enter the 6-digit code sent to {formData.email}</p>

              <div>
                <label className="label">Verification Code</label>
                <input
                  type="text"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button type="submit" disabled={loading || emailCode.length !== 6} className="btn btn-primary flex-1">
                  {loading ? 'Completing...' : 'Complete Registration'}
                </button>
                <button
                  type="button"
                  onClick={() => handleResendOTP('email')}
                  disabled={loading || resendCooldown > 0}
                  className="btn btn-secondary"
                >
                  {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && registeredParticipant && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900">Registration Complete!</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Participant Name</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {registeredParticipant.firstName} {registeredParticipant.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unique ID</p>
                  <p className="text-3xl font-bold text-red-600 tracking-wider">
                    {registeredParticipant.uniqueId}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Unique ID has been sent to phone and email
                </p>
              </div>

              <button onClick={handleReset} className="btn btn-primary">
                Register Another Participant
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
