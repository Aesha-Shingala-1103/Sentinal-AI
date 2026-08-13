import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Landing from './components/Landing';
import Dashboard from './dashboardV2/Dashboard';
import CinematicLoader from './components/CinematicLoader';
import { AuthProvider } from './context/AuthContext';

type View = 'landing' | 'loading' | 'dashboard';

export default function App() {
  const [view, setView] = useState<View>('landing');

  const launch = () => setView('loading');
  const exit = () => setView('landing');

  return (
    <AuthProvider>
      {view === 'landing' && <Landing onLaunch={launch} />}
      {view === 'dashboard' && <Dashboard onExit={exit} />}

      <AnimatePresence>
        {view === 'loading' && (
          <CinematicLoader onComplete={() => setView('dashboard')} />
        )}
      </AnimatePresence>
    </AuthProvider>
  );
}
