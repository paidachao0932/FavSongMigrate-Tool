const steps = ['upload', 'edit', 'login', 'matching', 'result'] as const;
const labels = ['上传', '核对', '登录', '匹配', '完成'];

interface StepIndicatorProps {
  current: string;
}

export function StepIndicator({ current }: StepIndicatorProps) {
  const idx = steps.indexOf(current as typeof steps[number]);

  return (
    <div className="flex items-center justify-center gap-1 py-3">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full transition-all ${
              i === idx
                ? 'bg-indigo-400 w-4'
                : i < idx
                ? 'bg-indigo-500/50'
                : 'bg-white/10'
            }`}
          />
          {i < steps.length - 1 && (
            <div className={`w-6 h-px ${i < idx ? 'bg-indigo-500/30' : 'bg-white/5'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
