type Props = {
  value: number;
  onChange: (value: number) => void;
  label?: string;
};

export function StarRating({ value, onChange, label = "Importance" }: Props) {
  return (
    <div className="flex items-center gap-1">
      <span className="mr-2 text-xs text-muted">{label}</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} sur 5`}
          onClick={() => onChange(star)}
          className={`h-7 w-7 rounded-full text-sm transition ${
            star <= value
              ? "bg-brand text-white"
              : "bg-brand-muted text-brand hover:bg-brand/15"
          }`}
        >
          {star}
        </button>
      ))}
    </div>
  );
}
