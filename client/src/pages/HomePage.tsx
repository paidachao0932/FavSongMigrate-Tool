import { useMigrationStore } from '../store/migrationStore';
import { UploadZone } from '../components/upload/UploadZone';
import { OCRProgress } from '../components/ocr/OCRProgress';
import { runOCR } from '../services/ocrEngine';
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

  const handleStartOCR = async () => {
    if (uploadedImages.length === 0) return;

    setOcrRunning(true);
    setOcrProgress(0);
    setStatusText('正在加载识别引擎...');

    try {
      const songs = await runOCR(uploadedImages, (p) => {
        setOcrProgress(p);
        setStatusText('正在识别图片文字...');
      });
      setRecognizedSongs(songs);
      setStep('edit');
    } catch (err) {
      setStatusText('识别失败，请重试');
    } finally {
      setOcrRunning(false);
    }
  };

  if (isOcrRunning) {
    return <OCRProgress progress={ocrProgress} status={statusText} />;
  }

  return <UploadZone onNext={handleStartOCR} />;
}
