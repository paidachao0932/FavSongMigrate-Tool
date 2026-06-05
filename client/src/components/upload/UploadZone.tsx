import { useCallback, useRef, useState } from 'react';
import { useMigrationStore } from '../../store/migrationStore';
import { Button } from '../shared/Button';

export function UploadZone({ onNext }: { onNext: () => void }) {
  const { setUploadedImages, uploadedImages } = useMigrationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

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

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
          dragOver ? 'border-indigo-400 bg-indigo-400/5' : 'border-white/10 hover:border-white/20'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-4xl mb-3">📸</div>
        <p className="text-white/60 text-sm mb-1">点击选择图片或拖拽到此处</p>
        <p className="text-white/20 text-xs">支持 JPG、PNG、长截图</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
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
          <Button size="lg" onClick={onNext}>开始识别</Button>
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
