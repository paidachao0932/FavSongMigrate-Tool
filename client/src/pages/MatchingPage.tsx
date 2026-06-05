import { useEffect, useState } from 'react';
import { useMigrationStore } from '../store/migrationStore';
import { MatchingProgress } from '../components/matching/MatchingProgress';
import { MatchResultCard } from '../components/matching/MatchResultCard';
import { ImportSummary } from '../components/results/ImportSummary';
import { DetailList } from '../components/results/DetailList';
import { Button } from '../components/shared/Button';
import { batchSearch, migrate } from '../services/api';
import type { MatchResult, MigrateResult } from '../types/song';

export function MatchingPage() {
  const {
    selectedPlatform,
    recognizedSongs,
    authCookie,
    matchResults,
    migrateResult,
    isMatching,
    matchingProgress,
    setMatchResults,
    setIsMatching,
    setMatchingProgress,
    setMigrateResult,
  } = useMigrationStore();
  const [importing, setImporting] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  // Auto-start matching on mount
  useEffect(() => {
    if (!selectedPlatform || !authCookie || matchResults.length > 0) return;
    doSearch();
  }, []);

  async function doSearch() {
    if (!selectedPlatform) return;
    setIsMatching(true);
    setMatchingProgress(0);

    const songs = recognizedSongs.map((s) => ({ title: s.title, artist: s.artist }));

    // For progress simulation, we do manual chunked requests
    // The backend /batch does all at once; we add client-side progress
    const { results } = await batchSearch(selectedPlatform.id, songs, authCookie);
    setMatchResults(results);
    setMatchingProgress(results.length);
    setIsMatching(false);
  }

  async function doImport() {
    if (!selectedPlatform) return;
    setImporting(true);

    const songs = recognizedSongs.map((s) => ({ title: s.title, artist: s.artist }));
    const playlistName = `从截图导入 ${new Date().toLocaleDateString('zh-CN')}`;

    try {
      const res = await migrate(selectedPlatform.id, songs, playlistName, authCookie, skipDuplicates);
      setMigrateResult(res);
    } catch {
      // error handled by toast in parent
    } finally {
      setImporting(false);
    }
  }

  // Show result view
  if (migrateResult) {
    const imported = migrateResult.details.filter((d) => d.status === 'imported');
    const duplicates = migrateResult.details.filter((d) => d.status === 'duplicate');
    const notFound = migrateResult.details.filter((d) => d.status === 'not_found');

    return (
      <div className="max-w-md mx-auto py-4">
        <ImportSummary result={migrateResult} />
        <DetailList title="新导入" details={imported} type="imported" defaultExpanded />
        <DetailList title="已收藏 (跳过)" details={duplicates} type="duplicate" />
        <DetailList title="未找到" details={notFound} type="not_found" />
      </div>
    );
  }

  // Show matching progress
  if (isMatching || matchResults.length === 0) {
    return (
      <div className="max-w-md mx-auto">
        <MatchingProgress current={matchingProgress} total={recognizedSongs.length} />
      </div>
    );
  }

  // Show match results with duplicate toggle and import button
  const newSongs = matchResults.filter((r) => !r.duplicate);
  const dupSongs = matchResults.filter((r) => r.duplicate);
  const matchedNew = newSongs.filter((r) => r.matched);
  const notFound = newSongs.filter((r) => !r.matched);

  return (
    <div className="max-w-md mx-auto py-4">
      <h2 className="text-lg font-semibold mb-1 text-center">匹配结果</h2>

      {/* Summary */}
      <div className="flex justify-center gap-4 mb-4 text-sm">
        <span className="text-green-400">🟢 新歌 {matchedNew.length}</span>
        <span className="text-yellow-400">🟡 已收藏 {dupSongs.length}</span>
        <span className="text-red-400">🔴 未找到 {notFound.length}</span>
      </div>

      {/* Skip duplicates toggle */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
          <input
            type="checkbox"
            checked={skipDuplicates}
            onChange={(e) => setSkipDuplicates(e.target.checked)}
            className="accent-indigo-500"
          />
          跳过已收藏的歌曲
        </label>
      </div>

      {/* Results list */}
      <div className="space-y-1.5 mb-4 max-h-[40vh] overflow-y-auto">
        {matchResults.map((r, i) => (
          <MatchResultCard key={i} result={r} />
        ))}
      </div>

      <Button size="lg" onClick={doImport} loading={importing}>
        一键导入 ({skipDuplicates ? matchedNew.length : matchResults.filter((r) => r.matched).length} 首)
      </Button>
    </div>
  );
}
