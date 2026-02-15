import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RegisterParticipantPage } from './pages/RegisterParticipantPage';
import { ParticipantsPage } from './pages/ParticipantsPage';
import { PrizesPage } from './pages/PrizesPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { StaffPage } from './pages/StaffPage';
import { ActivityLogsPage } from './pages/ActivityLogsPage';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/participants/register"
              element={
                <ProtectedRoute>
                  <RegisterParticipantPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/participants"
              element={
                <ProtectedRoute>
                  <ParticipantsPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/prizes"
              element={
                <ProtectedRoute>
                  <PrizesPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <LeaderboardPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/staff"
              element={
                <ProtectedRoute requireSuperAdmin>
                  <StaffPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/logs"
              element={
                <ProtectedRoute requireSuperAdmin>
                  <ActivityLogsPage />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
