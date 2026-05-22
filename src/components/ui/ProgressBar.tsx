type Props = {
  current: number;
  total: number;
  label?: string;
};

export function ProgressBar({ current, total, label }: Props) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{label ?? `Étape ${current} sur ${total}`}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-brand-muted">
        <div
          className="h-full rounded-full bg-brand transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
