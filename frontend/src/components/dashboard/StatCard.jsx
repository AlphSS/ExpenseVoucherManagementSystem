export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "emerald",
  trend = null,
  prefix = "",
  suffix = "",
}) {
  const tones = {
    emerald: {
      icon: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
      accent: "hover:border-emerald-300",
    },
    amber: {
      icon: "bg-amber-500/10 text-amber-700 border-amber-500/20",
      accent: "hover:border-amber-300",
    },
    indigo: {
      icon: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
      accent: "hover:border-indigo-300",
    },
    rose: {
      icon: "bg-rose-500/10 text-rose-700 border-rose-500/20",
      accent: "hover:border-rose-300",
    },
    slate: {
      icon: "bg-slate-500/10 text-slate-700 border-slate-500/20",
      accent: "hover:border-slate-300",
    },
  };

  const currentTone = tones[tone] ?? tones.emerald;

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 ${currentTone.accent}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono-numbers sm:text-3xl">
            {prefix}
            {value ?? 0}
            {suffix}
          </p>

          {description && (
            <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 truncate">
              {description}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${currentTone.icon}`}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-emerald-700">{trend.value}</span>
          <span className="text-slate-400">{trend.label}</span>
        </div>
      )}
    </article>
  );
}
