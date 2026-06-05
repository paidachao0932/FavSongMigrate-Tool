interface OCRProgressProps {
  progress: number;
  status: string;
}

export function OCRProgress({ progress, status }: OCRProgressProps) {
  return (
    <div className="max-w-md mx-auto py-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-indigo-400 rounded-full animate-spin" />
      </div>
      <p className="text-white/70 text-sm mb-2">{status}</p>
      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-white/30 text-xs mt-1">{progress}%</p>
    </div>
  );
}
