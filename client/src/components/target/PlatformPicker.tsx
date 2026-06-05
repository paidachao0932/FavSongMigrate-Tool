import type { PlatformMeta } from '../../types/platform';
import { Card } from '../shared/Card';

const platformColors: Record<string, string> = {
  netease: 'bg-red-500',
  qqmusic: 'bg-green-500',
  kugou: 'bg-blue-500',
  kuwo: 'bg-yellow-500',
};

const platformIcons: Record<string, string> = {
  netease: '🎵',
  qqmusic: '🎶',
  kugou: '🎤',
  kuwo: '🎧',
};

interface PlatformPickerProps {
  platforms: PlatformMeta[];
  selected: PlatformMeta | null;
  onSelect: (p: PlatformMeta) => void;
}

export function PlatformPicker({ platforms, selected, onSelect }: PlatformPickerProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">选择目标平台</h2>
      <p className="text-white/40 text-sm -mt-2 mb-3">你要把歌单导入到哪个音乐平台？</p>
      <div className="grid grid-cols-2 gap-3">
        {platforms.map((p) => {
          const isSelected = selected?.id === p.id;
          const enabled = p.loginType !== undefined;

          return (
            <Card
              key={p.id}
              onClick={enabled ? () => onSelect(p) : undefined}
              className={`text-center transition-all ${
                !enabled ? 'opacity-40 pointer-events-none' : ''
              } ${
                isSelected
                  ? 'border-indigo-400/50 bg-indigo-500/10 ring-1 ring-indigo-400/30'
                  : ''
              }`}
            >
              <div
                className={`w-10 h-10 mx-auto rounded-full ${platformColors[p.id] || 'bg-white/20'} flex items-center justify-center text-xl mb-1.5`}
              >
                {platformIcons[p.id] || '?'}
              </div>
              <p className="text-sm font-medium">{p.nameZh}</p>
              <p className="text-xs text-white/30">{p.name}</p>
              {!enabled && (
                <span className="text-[10px] text-yellow-400/60 mt-1 block">即将支持</span>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
