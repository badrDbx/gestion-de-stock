import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { Suspense, lazy } from 'react';

// Layouts
import { AdminLayout } from './layouts/AdminLayout';
import { UserLayout } from './layouts/UserLayout';

// Lazy Loaded Pages
const Login = lazy(() => import('@/pages/shared/Login').then(m => ({ default: m.Login })));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard').then(m => ({ default: m.Dashboard })));
const AdminMaterials = lazy(() => import('@/pages/admin/Materials').then(m => ({ default: m.Materials })));
const AdminUsers = lazy(() => import('@/pages/admin/Users').then(m => ({ default: m.Users })));
const AdminRequests = lazy(() => import('@/pages/admin/Requests').then(m => ({ default: m.Requests })));
const UserDashboard = lazy(() => import('@/pages/user/Dashboard').then(m => ({ default: m.Dashboard })));
const Catalog = lazy(() => import('@/pages/user/Catalog').then(m => ({ default: m.Catalog })));
const MyRequests = lazy(() => import('@/pages/user/MyRequests').then(m => ({ default: m.MyRequests })));

import { TopLoadingBar } from '@/components/TopLoadingBar';
import { AnimatePresence } from 'framer-motion';


// Route guard: redirect to /login if not authenticated
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// Route guard: redirect to correct portal if already logged in
function RequireGuest({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/portal'} replace />;
  }
  return <>{children}</>;
}

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopLoadingBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <Suspense fallback={null}>
            <Routes>
              {/* Login */}
              <Route
                path="/login"
                element={
                  <RequireGuest>
                    <Login />
                  </RequireGuest>
                }
              />

              {/* Admin Module */}
              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <AdminLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="materials" element={<AdminMaterials />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="requests" element={<AdminRequests />} />
              </Route>

              {/* User Portal Module */}
              <Route
                path="/portal"
                element={
                  <RequireAuth>
                    <UserLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<UserDashboard />} />
                <Route path="catalog" element={<Catalog />} />
                <Route path="my-requests" element={<MyRequests />} />
              </Route>

              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </div>
    </div>
  );
}

import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
          <Toaster position="bottom-right" closeButton gap={12} offset={24} />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
