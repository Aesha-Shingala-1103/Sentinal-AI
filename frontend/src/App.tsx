import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Landing from './components/Landing';
import Dashboard from './dashboardV2/Dashboard';
import CinematicLoader from './components/CinematicLoader';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './dashboardV2/components/AuthModal';

type View = 'landing' | 'loading' | 'dashboard';

function AppContent() {
  const [view, setView] = useState<View>('landing');
  const [authOpen, setAuthOpen] = useState(false);
  const { user } = useAuth();

  const launch = () => {
    if (user) {
      setView('loading');
    } else {
      setAuthOpen(true);
    }
  };

  useEffect(() => {
    if (user && authOpen) {
      setAuthOpen(false);
      setView('loading');
    }
  }, [user, authOpen]);

  const exit = () => setView('landing');

  return (
    <>
      {view === 'landing' && <Landing onLaunch={launch} />}
      {view === 'dashboard' && <Dashboard onExit={exit} />}

      <AnimatePresence>
        {view === 'loading' && (
          <CinematicLoader onComplete={() => setView('dashboard')} />
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}