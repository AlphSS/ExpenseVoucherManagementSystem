import { useState } from "react";
import { UserCheck, Shield, Receipt, ArrowRight, Sparkles } from "lucide-react";

export default function DevQuickLogin({ onLogin }) {
  const [loadingRole, setLoadingRole] = useState(null);
  const [error, setError] = useState("");

  if (!import.meta.env.DEV) return null;

  const accounts = [
    {
      role: "EMPLOYEE",
      title: "Employee Portal",
      email: import.meta.env.VITE_DEV_EMPLOYEE_EMAIL || "employee@example.com",
      password: import.meta.env.VITE_DEV_EMPLOYEE_PASSWORD || "EmployeeTest2026!",
      icon: UserCheck,
      badge: "Claimant",
      color: "border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-emerald-800",
      iconBg: "bg-emerald-100 text-emerald-800",
    },
    {
      role: "DIRECTOR",
      title: "Director Portal",
      email: import.meta.env.VITE_DEV_DIRECTOR_EMAIL || "directore@example.com",
      password: import.meta.env.VITE_DEV_DIRECTOR_PASSWORD || "DirectorTest2026!",
      icon: Shield,
      badge: "Approval",
      color: "border-amber-200 hover:border-amber-500 hover:bg-amber-50/30 text-amber-800",
      iconBg: "bg-amber-100 text-amber-800",
    },
    {
      role: "ACCOUNTS",
      title: "Accounts Portal",
      email: import.meta.env.VITE_DEV_ACCOUNTS_EMAIL || "accounts@example.com",
      password: import.meta.env.VITE_DEV_ACCOUNTS_PASSWORD || "AccountsTest2026",
      icon: Receipt,
      badge: "Audit",
      color: "border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50/30 text-indigo-800",
      iconBg: "bg-indigo-100 text-indigo-800",
    },
  ];

  async function handleQuickLogin(account) {
    if (loadingRole) return;

    try {
      setLoadingRole(account.role);
      setError("");
      await onLogin(account.email, account.password);
    } catch (err) {
      setError(err.message || `Failed to sign in as ${account.title}`);
    } finally {
      setLoadingRole(null);
    }
  }

  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles size={15} className="text-emerald-700" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Quick Persona Switcher
          </span>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
          Dev Environment
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-3">
        Select a workspace role below to sign in instantly with test credentials:
      </p>

      <div className="grid grid-cols-1 gap-2.5">
        {accounts.map((acc) => {
          const Icon = acc.icon;
          const isLoading = loadingRole === acc.role;

          return (
            <button
              key={acc.role}
              type="button"
              disabled={!!loadingRole}
              onClick={() => handleQuickLogin(acc)}
              className={`group flex items-center justify-between p-3 rounded-xl border bg-white text-left transition-all shadow-2xs ${acc.color} disabled:opacity-50`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${acc.iconBg}`}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {acc.title}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                      {acc.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {acc.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all">
                <span>{isLoading ? "Signing in..." : "Enter"}</span>
                <ArrowRight size={14} />
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs text-rose-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
