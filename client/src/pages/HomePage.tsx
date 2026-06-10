import { useMigrationStore } from '../store/migrationStore';
import { UploadZone } from '../components/upload/UploadZone';
import { OCRProgress } from '../components/ocr/OCRProgress';
import { useState } from 'react';

export function HomePage() {
  const {
    uploadedImages,
    isOcrRunning,
    ocrProgress,
    setOcrRunning,
    setOcrProgress,
    setRecognizedSongs,
    setUploadedUrls,
    setStep,
  } = useMigrationStore();
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');
  const [uploadedUrls, setUploadedUrlsLocal] = useState<string[]>([]);

  const handleUploadAndNext = async () => {
    if (uploadedImages.length === 0) return;

    setError('');
    setOcrRunning(true);
    setOcrProgress(0);
    setStatusText('Uploading images...');

    try {
      const formData = new FormData();
      for (const f of uploadedImages) {
        formData.append('images', f);
      }

      const xhr = new XMLHttpRequest();
      const result: { urls: string[] } = await new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setOcrProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        });
        xhr.addEventListener('error', () => reject(new Error('Cannot reach server. Is start.bat running?')));
        xhr.open('POST', '/api/ocr');
        xhr.send(formData);
      });

      setUploadedUrls(result.urls); // store
      setUploadedUrlsLocal(result.urls); // local
      // Initialize empty song list — user fills in manually
      setRecognizedSongs([]);
      setStep('edit');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError('Upload failed: ' + msg);
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
      <UploadZone onNext={handleUploadAndNext} uploadedUrls={uploadedUrls} />
    </>
  );
}
