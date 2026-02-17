# Quick Fix: Implement Change Password Feature

This guide shows you how to add the missing self-service password change feature.

## Estimated Time: 4-6 hours

---

## Step 1: Backend - Add Change Password Endpoint

### File: `backend/src/api/auth/routes.ts`

Add this route after the logout route:

```typescript
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

router.post(
  '/change-password',
  authenticateToken,
  validateBody(changePasswordSchema),
  async (req: AuthRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;

      // Prevent password reuse
      if (currentPassword === newPassword) {
        res.status(400).json({ error: 'New password must be different from current password' });
        return;
      }

      const result = await changeStaffPassword(userId, currentPassword, newPassword);

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
);
```

---

## Step 2: Backend - Add Service Function

### File: `backend/src/domain/staff/service.ts`

Add this function at the end:

```typescript
export async function changeStaffPassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current password hash
    const result = await pool.query(
      'SELECT password_hash FROM staff_users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const currentHash = result.rows[0].password_hash;

    // Verify current password
    const isValid = await verifyPassword(currentPassword, currentHash);
    if (!isValid) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash new password
    const newHash = await hashPassword(newPassword);

    // Update password
    await pool.query(
      `UPDATE staff_users 
       SET password_hash = $1, updated_at = NOW() 
       WHERE id = $2`,
      [newHash, userId]
    );

    // Log the password change
    await pool.query(
      `INSERT INTO transaction_log (type, staff_user_id, note)
       VALUES ($1, $2, $3)`,
      ['RESET_PASSWORD', userId, 'User changed their own password']
    );

    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, error: 'Failed to change password' };
  }
}
```

Don't forget to import it in routes:

```typescript
import {
  // ... existing imports
  changeStaffPassword, // ADD THIS
} from '../../domain/staff/service';
```

---

## Step 3: Frontend - Add Change Password API

### File: `admin-panel/src/api/auth.ts`

Add this function:

```typescript
changePassword: async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  await api.post('/auth/change-password', {
    currentPassword,
    newPassword,
  });
},
```

---

## Step 4: Frontend - Create Change Password Page

### File: `admin-panel/src/pages/ChangePasswordPage.tsx`

Create new file:

```tsx
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { Layout } from '../components/layout/Layout';
import { Lock, Check, X } from 'lucide-react';

export function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
    { label: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      await authApi.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Lock className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                Password changed successfully! Redirecting...
              </div>
            )}

            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input"
                placeholder="Enter your current password"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
                placeholder="Enter new password"
                required
              />
              
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req, idx) => {
                  const passed = req.test(newPassword);
                  return (
                    <div key={idx} className="flex items-center space-x-2 text-sm">
                      {passed ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={passed ? 'text-green-600' : 'text-gray-500'}>
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="Confirm new password"
                required
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading || success}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
```

---

## Step 5: Frontend - Add Route

### File: `admin-panel/src/App.tsx`

Add import:

```typescript
import { ChangePasswordPage } from './pages/ChangePasswordPage';
```

Add route (after the login route):

```tsx
<Route
  path="/change-password"
  element={
    <ProtectedRoute>
      <ChangePasswordPage />
    </ProtectedRoute>
  }
/>
```

---

## Step 6: Frontend - Add Link to Header

### File: `admin-panel/src/components/layout/Header.tsx`

Add a link in the user menu:

```tsx
import { Link } from 'react-router-dom';
import { Lock, LogOut } from 'lucide-react';

// In the user dropdown menu, add:
<Link
  to="/change-password"
  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
>
  <Lock className="w-4 h-4 inline mr-2" />
  Change Password
</Link>
```

---

## Testing Checklist

- [ ] Can login with default credentials
- [ ] Change password link appears in user menu
- [ ] Can access `/change-password` page
- [ ] Password requirements show correctly
- [ ] Error when current password is wrong
- [ ] Error when passwords don't match
- [ ] Error when new password same as current
- [ ] Success message after change
- [ ] Can login with new password
- [ ] Cannot login with old password
- [ ] Activity log shows password change

---

## Security Notes

1. **Rate Limiting:** Consider adding rate limiting to prevent brute force
2. **Audit Log:** Password changes are logged in `transaction_log`
3. **Session:** Current session remains valid after password change
4. **Validation:** Password requirements enforced both frontend and backend

---

## Optional Enhancements

1. **Force logout on password change** (require re-login)
2. **Email notification** when password is changed
3. **Password history** (prevent reusing last N passwords)
4. **Password expiry** (force change every 90 days)
5. **Strength meter** (visual indicator of password strength)

---

## Next: Implement Forgot Password

After this is working, the next priority is the "Forgot Password" flow. See the main analysis document for full implementation details.
