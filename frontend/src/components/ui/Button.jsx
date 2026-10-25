import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 hover:shadow-md hover:shadow-emerald-600/30 active:scale-[0.98]",
  indigo:
    "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-600/20 hover:from-indigo-500 hover:to-violet-500 hover:shadow-md hover:shadow-indigo-600/30 active:scale-[0.98]",
  secondary:
    "border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:scale-[0.98]",
  danger:
    "bg-rose-600 text-white shadow-sm shadow-rose-600/20 hover:bg-rose-500 active:scale-[0.98]",
  dangerOutline:
    "border border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100 hover:border-rose-300 active:scale-[0.98]",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-950 active:scale-[0.98]",
  dark:
    "bg-slate-900 text-white hover:bg-slate-800 shadow-sm active:scale-[0.98]",
};

const sizes = {
  xs: "px-2.5 py-1.5 text-xs rounded-lg gap-1.5",
  sm: "px-3 py-2 text-xs font-semibold rounded-xl gap-2",
  md: "px-4 py-2.5 text-sm font-semibold rounded-xl gap-2.5",
  lg: "px-5 py-3 text-base font-semibold rounded-xl gap-3",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  icon: Icon,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50 select-none
        ${variants[variant] ?? variants.primary}
        ${sizes[size] ?? sizes.md}
        ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === "xs" ? 14 : size === "sm" ? 16 : 18} className="animate-spin" />
      ) : Icon ? (
        <Icon size={size === "xs" ? 14 : size === "sm" ? 16 : 18} />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
