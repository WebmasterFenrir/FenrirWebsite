import React, { useState, useEffect } from 'react';
import pb from './lib/pocketbase';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileSetup from './components/ProfileSetup';
import AdminUserAdd from './components/AdminUserAdd';
import { Button } from '@/components/ui/button';

const SUPERUSER_EMAIL = 'webmaster@fenrirclub.be';

const DashboardHome: React.FC<{ user: any; isSuperuser: boolean }> = ({ user, isSuperuser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    pb.authStore.clear();
    navigate('/login');
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome, {user.name || user.email}</p>
      <div className="flex gap-2">
        {isSuperuser && (
          <Button asChild variant="outline">
            <Link to="/admin">Admin Panel</Link>
          </Button>
        )}
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    pb.authStore.clear();
    navigate('/login');
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <AdminUserAdd />
      <div className="flex gap-2 mt-4">
        <Button asChild variant="outline">
          <Link to="/">Back to Dashboard</Link>
        </Button>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export function App() {
  const [user, setUser] = useState<any>(pb.authStore.isValid ? pb.authStore.record : null);

  useEffect(() => {
    const removeListener = pb.authStore.onChange(() => {
      setUser(pb.authStore.isValid ? pb.authStore.record : null);
    });
    return () => removeListener();
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
  };

  const handleSetupComplete = (updatedUser: Record<string, unknown>) => {
    setUser(updatedUser);
  };

  const isAuthenticated = !!user;
  const isSuperuser = user?.email === SUPERUSER_EMAIL;
  const needsSetup = isAuthenticated && !user?.name;

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to={needsSetup ? '/setup' : '/'} replace />
              : <Login onLoginSuccess={handleLoginSuccess} />
          }
        />

        <Route
          path="/setup"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              {needsSetup
                ? <ProfileSetup user={user} onComplete={handleSetupComplete} />
                : <Navigate to="/" replace />
              }
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              {needsSetup
                ? <Navigate to="/setup" replace />
                : <DashboardHome user={user} isSuperuser={isSuperuser} />
              }
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} requireSuperuser isSuperuser={isSuperuser}>
              {needsSetup
                ? <Navigate to="/setup" replace />
                : <AdminDashboard />
              }
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={isAuthenticated ? (needsSetup ? '/setup' : '/') : '/login'} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
