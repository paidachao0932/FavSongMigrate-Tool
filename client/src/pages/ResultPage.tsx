import { useMigrationStore } from '../store/migrationStore';

export function ResultPage() {
  // ResultPage is rendered as part of MatchingPage when migrateResult exists.
  // This is a standalone route for direct access.
  const { migrateResult } = useMigrationStore();

  if (!migrateResult) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <p className="text-white/40">没有导入记录</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="text-xl font-semibold">导入完成</h2>
      <p className="text-white/40 text-sm">
        歌单「{migrateResult.playlistName}」已创建
      </p>
    </div>
  );
}
