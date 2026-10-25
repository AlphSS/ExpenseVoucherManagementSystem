import { Loader2 } from "lucide-react";

export function LoadingSpinner({ text = "Loading data...", className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-600 animate-spin" />
        <Loader2 className="absolute text-emerald-600 animate-spin" size={20} />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">{text}</p>
      <p className="mt-1 text-xs text-slate-400">Please wait a moment...</p>
    </div>
  );
}

export function SkeletonRow({ cols = 5 }) {
  return (
    <div className="flex items-center gap-4 py-4 px-6 border-b border-slate-100 animate-pulse">
      {Array.from({ length: cols }).map((_, idx) => (
        <div
          key={idx}
          className={`h-4 bg-slate-200/80 rounded-md ${
            idx === 0 ? "w-28" : idx === 1 ? "w-48" : "flex-1"
          }`}
        />
      ))}
    </div>
  );
}

export default function LoadingState({ text, rows = 4, cols = 5 }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <div className="p-6 border-b border-slate-100">
        <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, idx) => (
          <SkeletonRow key={idx} cols={cols} />
        ))}
      </div>
      {text && (
        <div className="p-4 text-center text-xs text-slate-400 bg-slate-50/50">
          {text}
        </div>
      )}
    </div>
  );
}
