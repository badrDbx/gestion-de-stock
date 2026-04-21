import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

// Layouts - Updated to new src/layouts folder
import { AdminLayout } from './layouts/AdminLayout';
import { UserLayout } from './layouts/UserLayout';

// Admin Pages
import { Dashboard as AdminDashboard } from '@/pages/admin/Dashboard';
import { Materials as AdminMaterials } from '@/pages/admin/Materials';
import { Users as AdminUsers } from '@/pages/admin/Users';
import { Requests as AdminRequests } from '@/pages/admin/Requests';

// User Pages
import { Dashboard as UserDashboard } from '@/pages/user/Dashboard';
import { Catalog } from '@/pages/user/Catalog';
import { MyRequests } from '@/pages/user/MyRequests';
import { MyBorrowed } from '@/pages/user/MyBorrowed';

/**
 * DevSwitcher: Quick toggle between Admin and User portals.
 * Placed at the top as requested for UI development speed.
 */
function AppContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          {/* Admin Module */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="materials" element={<AdminMaterials />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="requests" element={<AdminRequests />} />
          </Route>

          {/* User Portal Module */}
          <Route path="/portal" element={<UserLayout />}>
            <Route index element={<UserDashboard />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="my-requests" element={<MyRequests />} />
            <Route path="my-borrowed" element={<MyBorrowed />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
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
          <Toaster position="top-center" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
