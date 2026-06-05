import { useState } from 'react';
import type { MigrateDetail } from '../../types/song';

interface DetailListProps {
  title: string;
  details: MigrateDetail[];
  type: 'imported' | 'duplicate' | 'not_found';
  defaultExpanded?: boolean;
}

const colors = {
  imported: 'text-green-400',
  duplicate: 'text-yellow-400',
  not_found: 'text-red-400',
};

export function DetailList({ title, details, type, defaultExpanded = false }: DetailListProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (details.length === 0) return null;

  return (
    <div className="mb-2">
      <button
        className="w-full flex items-center justify-between p-3 bg-white/5 rounded-xl"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-sm font-medium">
          <span className={colors[type]}>●</span> {title} ({details.length}首)
        </span>
        <span className="text-white/30 text-xs">{expanded ? '收起' : '展开'}</span>
      </button>

      {expanded && (
        <div className="mt-1 space-y-0.5 max-h-48 overflow-y-auto">
          {details.map((d, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 text-xs">
              <span className="text-white/70 truncate flex-1">{d.title}</span>
              <span className="text-white/30 truncate">{d.artist || '未知'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
