interface MatchingProgressProps {
  current: number;
  total: number;
}

export function MatchingProgress({ current, total }: MatchingProgressProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
        <span className="text-lg font-bold text-indigo-400">{pct}%</span>
      </div>
      <p className="text-white/70 text-sm mb-2">
        正在搜索匹配 {current}/{total}
      </p>
      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden max-w-xs mx-auto">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
