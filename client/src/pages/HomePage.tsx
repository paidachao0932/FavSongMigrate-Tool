import { useMigrationStore } from '../store/migrationStore';
import { UploadZone } from '../components/upload/UploadZone';
import { OCRProgress } from '../components/ocr/OCRProgress';
import { ocrImages } from '../services/api';
import { useState } from 'react';

export function HomePage() {
  const {
    uploadedImages,
    isOcrRunning,
    ocrProgress,
    setOcrRunning,
    setOcrProgress,
    setRecognizedSongs,
    setStep,
  } = useMigrationStore();
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');

  const handleStartOCR = async () => {
    if (uploadedImages.length === 0) return;

    setError('');
    setOcrRunning(true);
    setOcrProgress(0);
    setStatusText('Uploading & recognizing...');

    try {
      const songs = await ocrImages(uploadedImages, (p) => {
        setOcrProgress(p);
        if (p < 50) {
          setStatusText('Uploading images... ' + p + '%');
        } else if (p < 95) {
          setStatusText('Recognizing text... ' + p + '%');
        } else {
          setStatusText('Done!');
        }
      });
      setRecognizedSongs(songs);
      setStep('edit');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('OCR Error:', msg);
      setError('OCR failed: ' + msg);
    } finally {
      setOcrRunning(false);
    }
  };

  if (isOcrRunning) {
    return <OCRProgress progress={ocrProgress} status={statusText} />;
  }

  return (
    <>
      {error && (
        <div className="max-w-md mx-auto mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
          {error}
          <button
            className="block mx-auto mt-2 text-xs text-red-300 underline"
            onClick={() => setError('')}
          >
            Dismiss
          </button>
        </div>
      )}
      <UploadZone onNext={handleStartOCR} />
    </>
  );
}
