import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { RequireAuth } from '@/components/auth/RequireAuth';
import Header from '@/components/common/Header';
import { Toaster } from '@/components/ui/toaster';
import routes from './routes';

function AppContent() {
  const { loading } = useAuth();
  const location = useLocation();
  
  // Don't show header on login and signup pages
  const hideHeader = ['/login', '/signup'].includes(location.pathname);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <RequireAuth whiteList={['/login', '/signup']}>
        {!hideHeader && <Header />}
        <main className="min-h-screen">
          <Routes>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={route.element}
              />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </RequireAuth>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
