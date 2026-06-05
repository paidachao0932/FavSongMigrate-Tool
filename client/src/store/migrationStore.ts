import { create } from 'zustand';
import type { MigrationState } from '../types/migration';

const initialState: Omit<MigrationState, 'setStep' | 'setUploadedImages' | 'setOcrRunning' | 'setOcrProgress' | 'setRecognizedSongs' | 'setSelectedPlatform' | 'setQrInfo' | 'setQrStatus' | 'setAuthCookie' | 'setMatchResults' | 'setIsMatching' | 'setMatchingProgress' | 'setMigrateResult' | 'reset'> = {
  step: 'upload',
  uploadedImages: [],
  previewUrls: [],
  isOcrRunning: false,
  ocrProgress: 0,
  recognizedSongs: [],
  selectedPlatform: null,
  qrKey: '',
  qrImage: '',
  qrStatus: 'idle',
  authCookie: '',
  matchResults: [],
  isMatching: false,
  matchingProgress: 0,
  migrateResult: null,
};

export const useMigrationStore = create<MigrationState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setUploadedImages: (files) =>
    set({
      uploadedImages: files,
      previewUrls: files.map((f) => URL.createObjectURL(f)),
    }),

  setOcrRunning: (running) => set({ isOcrRunning: running }),
  setOcrProgress: (progress) => set({ ocrProgress: progress }),

  setRecognizedSongs: (songs) => set({ recognizedSongs: songs }),

  setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),

  setQrInfo: (key, image) => set({ qrKey: key, qrImage: image, qrStatus: 'waiting' }),
  setQrStatus: (status) => set({ qrStatus: status }),
  setAuthCookie: (cookie) => set({ authCookie: cookie, qrStatus: 'confirmed' }),

  setMatchResults: (results) => set({ matchResults: results }),
  setIsMatching: (matching) => set({ isMatching: matching }),
  setMatchingProgress: (progress) => set({ matchingProgress: progress }),
  setMigrateResult: (result) => set({ migrateResult: result }),

  reset: () => set(initialState),
}));
