import type { RecognizedSong, MatchResult, MigrateResult } from './song';
import type { PlatformMeta } from './platform';

export type MigrationStep = 'upload' | 'edit' | 'login' | 'matching' | 'result';

export interface MigrationState {
  step: MigrationStep;

  // Upload
  uploadedImages: File[];
  previewUrls: string[];
  uploadedUrls: string[];

  // OCR
  isOcrRunning: boolean;
  ocrProgress: number;
  recognizedSongs: RecognizedSong[];

  // Auth
  selectedPlatform: PlatformMeta | null;
  qrKey: string;
  qrImage: string;
  qrStatus: 'idle' | 'waiting' | 'scanned' | 'confirmed' | 'expired';
  authCookie: string;

  // Matching
  matchResults: MatchResult[];
  isMatching: boolean;
  matchingProgress: number;

  // Result
  migrateResult: MigrateResult | null;

  // Actions
  setStep: (step: MigrationStep) => void;
  setUploadedImages: (files: File[]) => void;
  setUploadedUrls: (urls: string[]) => void;
  setOcrRunning: (running: boolean) => void;
  setOcrProgress: (progress: number) => void;
  setRecognizedSongs: (songs: RecognizedSong[]) => void;
  setSelectedPlatform: (platform: PlatformMeta | null) => void;
  setQrInfo: (key: string, image: string) => void;
  setQrStatus: (status: MigrationState['qrStatus']) => void;
  setAuthCookie: (cookie: string) => void;
  setMatchResults: (results: MatchResult[]) => void;
  setIsMatching: (matching: boolean) => void;
  setMatchingProgress: (progress: number) => void;
  setMigrateResult: (result: MigrateResult | null) => void;
  reset: () => void;
}
