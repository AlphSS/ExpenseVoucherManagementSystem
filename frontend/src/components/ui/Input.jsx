export default function Input({
  label,
  id,
  error,
  helperText,
  icon: Icon,
  className = "",
  containerClassName = "",
  required = false,
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className="flex items-center justify-between text-xs font-semibold tracking-wide uppercase text-slate-700"
        >
          <span>
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </span>
        </label>
      )}

      <div className="relative rounded-xl shadow-2xs">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Icon size={18} />
          </div>
        )}

        <input
          id={id}
          required={required}
          className={`w-full rounded-xl border bg-white text-sm text-slate-900 transition-all placeholder:text-slate-400 outline-none
            ${Icon ? "pl-10 pr-4" : "px-4"} py-2.5
            ${
              error
                ? "border-rose-300 ring-3 ring-rose-500/10 focus:border-rose-500"
                : "border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15"
            }
            ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs font-medium text-rose-600 animate-fadeIn">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
