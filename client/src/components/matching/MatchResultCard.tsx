import type { MatchResult } from '../../types/song';

interface MatchResultCardProps {
  result: MatchResult;
}

export function MatchResultCard({ result }: MatchResultCardProps) {
  return (
    <div className={`flex items-center gap-3 p-2.5 rounded-xl text-sm ${
      result.duplicate ? 'bg-yellow-500/5' :
      result.matched ? 'bg-green-500/5' :
      'bg-red-500/5'
    }`}>
      {/* Status icon */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
        result.duplicate ? 'bg-yellow-500/20 text-yellow-400' :
        result.matched ? 'bg-green-500/20 text-green-400' :
        'bg-red-500/20 text-red-400'
      }`}>
        {result.duplicate ? '✓' : result.matched ? '✓' : '✗'}
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <p className="text-white truncate">{result.query.title}</p>
        <p className="text-white/40 text-xs truncate">{result.query.artist || '未知歌手'}</p>
      </div>

      {/* Match info */}
      <div className="text-right flex-shrink-0">
        {result.duplicate ? (
          <span className="text-yellow-400/70 text-xs">已收藏</span>
        ) : result.matched ? (
          <div>
            <p className="text-green-400/70 text-xs">{Math.round(result.confidence * 100)}%</p>
            {result.bestMatch && (
              <p className="text-white/20 text-[10px] truncate max-w-[100px]">
                {result.bestMatch.title}
              </p>
            )}
          </div>
        ) : (
          <span className="text-red-400/70 text-xs">未找到</span>
        )}
      </div>
    </div>
  );
}
