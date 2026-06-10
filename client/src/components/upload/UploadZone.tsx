import { useCallback, useRef } from 'react';
import { useMigrationStore } from '../../store/migrationStore';
import { Button } from '../shared/Button';

export function UploadZone({ onNext }: { onNext: () => void }) {
  const { setUploadedImages, uploadedImages } = useMigrationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        setUploadedImages(imageFiles);
      }
    },
    [setUploadedImages]
  );

  return (
    <div className="max-w-md mx-auto py-6">
      <StepIndicator />

      <h2 className="text-xl font-semibold mb-1 text-center">上传歌单截图</h2>
      <p className="text-white/40 text-sm text-center mb-6">
        对歌单页面长截图，支持多张图片
      </p>

      {/* Upload buttons */}
      <div className="space-y-3">
        <button
          className="w-full py-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-medium active:scale-[0.98] transition-all"
          onClick={() => fileInputRef.current?.click()}
        >
          🖼️ 从相册选择
        </button>
        <button
          className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-medium active:scale-[0.98] transition-all"
          onClick={() => cameraInputRef.current?.click()}
        >
          📷 拍照
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Preview */}
      {uploadedImages.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-white/50">已选择 {uploadedImages.length} 张图片</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {uploadedImages.map((file, i) => (
              <img
                key={i}
                src={URL.createObjectURL(file)}
                alt={`截图 ${i + 1}`}
                className="w-20 h-28 object-cover rounded-lg border border-white/10 flex-shrink-0"
              />
            ))}
          </div>
          <Button size="lg" onClick={onNext}>下一步 →</Button>
        </div>
      )}
    </div>
  );
}

function StepIndicator() {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-6">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-all ${i === 0 ? 'bg-indigo-400 w-3' : 'bg-white/10'}`}
        />
      ))}
    </div>
  );
}
