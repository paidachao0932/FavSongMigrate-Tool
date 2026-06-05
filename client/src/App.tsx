import { useMigrationStore } from './store/migrationStore';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { EditSongsPage } from './pages/EditSongsPage';
import { LoginPage } from './pages/LoginPage';
import { MatchingPage } from './pages/MatchingPage';
import { Button } from './components/shared/Button';

export default function App() {
  const { step, reset } = useMigrationStore();

  const pages: Record<string, React.ReactNode> = {
    upload: <HomePage />,
    edit: <EditSongsPage />,
    login: <LoginPage />,
    matching: <MatchingPage />,
    result: <MatchingPage />, // result embedded in MatchingPage
  };

  return (
    <AppShell>
      <div className="min-h-[80vh]">
        {pages[step]}
      </div>

      {/* Bottom action bar for restart */}
      {step === 'result' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-gradient-to-t from-[#0f0f0f] to-transparent">
          <div className="max-w-md mx-auto">
            <Button size="lg" variant="secondary" onClick={reset}>
              重新开始
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
