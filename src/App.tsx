/**
 * Integra Networks — Elevate Partner Portal
 * Main application with routing and auth
 */

import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { SubmissionForm } from '@/components/form/SubmissionForm';
import { SubmissionHistory } from '@/components/form/SubmissionHistory';
import { PriceBook } from '@/components/form/PriceBook';
import { Loader2, BookOpen } from 'lucide-react';

// ── Login Page ──────────────────────────────────────────────────

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/submit');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-integra-navy to-integra-blue px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-integra-blue rounded-lg flex items-center justify-center font-bold text-2xl text-white mx-auto mb-4 shadow-lg">
            IN
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Integra Networks</h1>
          <p className="text-gray-300">Partner Portal</p>
        </div>

        {/* Login Card */}
        <div className="card-static shadow-xl">
          <h2 className="text-2xl font-bold text-integra-navy mb-6">Sign In</h2>

          {error && (
            <div className="alert alert-error mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {!import.meta.env.VITE_SUPABASE_URL && (
            <p className="text-center text-xs text-gray-400 mt-4 bg-gray-50 rounded p-2">
              Demo mode — enter any email and password
            </p>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          &copy; {new Date().getFullYear()} Integra Networks Ltd. All rights reserved.
        </p>
      </div>
    </div>
  );
};

// ── Authenticated App ───────────────────────────────────────────

type AppPage = 'submit' | 'history' | 'pricebook' | 'profile';

const AuthenticatedApp: React.FC = () => {
  const { agent, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<AppPage>('submit');

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-integra-blue" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigate = (page: 'submit' | 'history' | 'profile') => {
    setCurrentPage(page);
  };

  return (
    <AppShell
      agentName={agent.full_name}
      agentEmail={agent.email}
      currentPage={currentPage === 'pricebook' ? 'submit' : currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {/* Price Book toggle button */}
      {currentPage !== 'pricebook' && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setCurrentPage('pricebook')}
            className="btn-ghost btn-sm"
          >
            <BookOpen size={16} className="mr-1.5" />
            Price Book
          </button>
        </div>
      )}

      {currentPage === 'pricebook' && (
        <div className="mb-4">
          <button
            onClick={() => setCurrentPage('submit')}
            className="btn-ghost btn-sm"
          >
            ← Back to Submission
          </button>
        </div>
      )}

      {currentPage === 'submit' && (
        <SubmissionForm
          agent={agent}
          onSubmitted={() => setCurrentPage('history')}
        />
      )}

      {currentPage === 'history' && (
        <SubmissionHistory agentId={agent.id} />
      )}

      {currentPage === 'pricebook' && (
        <PriceBook />
      )}
    </AppShell>
  );
};

// ── Protected Route ─────────────────────────────────────────────

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-integra-blue" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// ── App Router ──────────────────────────────────────────────────

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/submit"
        element={
          <ProtectedRoute>
            <AuthenticatedApp />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
