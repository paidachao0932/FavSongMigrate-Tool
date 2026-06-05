import type { MigrateResult } from '../../types/song';

interface ImportSummaryProps {
  result: MigrateResult;
}

export function ImportSummary({ result }: ImportSummaryProps) {
  return (
    <div className="text-center py-6">
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="text-xl font-semibold mb-1">导入完成！</h2>
      <p className="text-white/40 text-sm mb-4">
        歌单「{result.playlistName}」已创建
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-500/10 rounded-xl p-3">
          <p className="text-2xl font-bold text-green-400">{result.imported}</p>
          <p className="text-xs text-white/40">新导入</p>
        </div>
        <div className="bg-yellow-500/10 rounded-xl p-3">
          <p className="text-2xl font-bold text-yellow-400">{result.skippedDuplicates}</p>
          <p className="text-xs text-white/40">已收藏</p>
        </div>
        <div className="bg-red-500/10 rounded-xl p-3">
          <p className="text-2xl font-bold text-red-400">{result.notFound}</p>
          <p className="text-xs text-white/40">未找到</p>
        </div>
      </div>
    </div>
  );
}
