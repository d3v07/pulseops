import { useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { AppShell } from './components/layout/AppShell';
import { AlertsView, EventsView, FunnelsView, SettingsView, UsersView } from './components/views';
import { useUIStore } from './stores/uiStore';

function App() {
  const { activeView, setActiveView } = useUIStore();

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const validViews = ['dashboard', 'events', 'users', 'funnels', 'alerts', 'settings'];
    if (hash && validViews.includes(hash)) {
      setActiveView(hash as typeof activeView);
    }

    const handleHashChange = () => {
      const next = window.location.hash.replace('#', '');
      if (validViews.includes(next)) {
        setActiveView(next as typeof activeView);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setActiveView]);

  useEffect(() => {
    window.location.hash = activeView;
  }, [activeView]);

  const renderView = () => {
    switch (activeView) {
      case 'events':
        return <EventsView />;
      case 'users':
        return <UsersView />;
      case 'funnels':
        return <FunnelsView />;
      case 'alerts':
        return <AlertsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppShell>
      {renderView()}
    </AppShell>
  );
}

export default App;
