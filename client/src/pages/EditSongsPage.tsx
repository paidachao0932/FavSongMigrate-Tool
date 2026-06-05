import { useMigrationStore } from '../store/migrationStore';
import { SongListEditor } from '../components/ocr/SongListEditor';

export function EditSongsPage() {
  const { setStep } = useMigrationStore();

  return <SongListEditor onNext={() => setStep('login')} />;
}
