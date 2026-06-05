import { useMigrationStore } from '../../store/migrationStore';

const stepLabels: Record<string, string> = {
  upload: '上传截图',
  edit: '核对歌单',
  login: '登录平台',
  matching: '搜索匹配',
  result: '导入完成',
};

export function TopBar() {
  const step = useMigrationStore((s) => s.step);

  return (
    <header className="pt-safe px-4 py-3 flex items-center justify-between border-b border-white/5">
      <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        歌单迁移
      </h1>
      <span className="text-xs text-white/40 bg-white/5 px-2.5 py-1 rounded-full">
        {stepLabels[step] || ''}
      </span>
    </header>
  );
}
