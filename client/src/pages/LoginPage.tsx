import { useEffect, useState } from 'react';
import { useMigrationStore } from '../store/migrationStore';
import { PlatformPicker } from '../components/target/PlatformPicker';
import { QRLoginPanel } from '../components/target/QRLoginPanel';
import { Button } from '../components/shared/Button';
import { fetchPlatforms } from '../services/api';
import type { PlatformMeta } from '../types/platform';

export function LoginPage() {
  const {
    selectedPlatform,
    authCookie,
    setSelectedPlatform,
    setStep,
  } = useMigrationStore();
  const [platforms, setPlatforms] = useState<PlatformMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatforms()
      .then(setPlatforms)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleContinue = () => {
    if (authCookie) setStep('matching');
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <div className="w-8 h-8 mx-auto border-2 border-white/20 border-t-indigo-400 rounded-full animate-spin" />
        <p className="text-white/40 text-sm mt-3">加载平台列表...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-4">
      {!selectedPlatform ? (
        <PlatformPicker
          platforms={platforms}
          selected={selectedPlatform}
          onSelect={setSelectedPlatform}
        />
      ) : (
        <div>
          <button
            className="text-white/50 text-sm mb-2 hover:text-white"
            onClick={() => setSelectedPlatform(null)}
          >
            ← 换个平台
          </button>
          <QRLoginPanel />
          {authCookie && (
            <Button size="lg" onClick={handleContinue}>
              已登录，开始匹配 →
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
