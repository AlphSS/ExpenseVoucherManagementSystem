import { useState } from "react";
import { UserCheck, Shield, Receipt, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

if (import.meta.env.VITE_ENABLE_DEMO_LOGIN !== "true") {
  return null;
}

const accounts = [
  {
    role: "EMPLOYEE",
    title: "Employee Portal",
    icon: UserCheck,
    badge: "Claimant",
    color: "border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/30",
    iconBg: "bg-emerald-100 text-emerald-800",
  },
  {
    role: "DIRECTOR",
    title: "Director Portal",
    icon: Shield,
    badge: "Approval",
    color: "border-amber-200 hover:border-amber-500 hover:bg-amber-50/30",
    iconBg: "bg-amber-100 text-amber-800",
  },
  {
    role: "ACCOUNTS",
    title: "Accounts Portal",
    icon: Receipt,
    badge: "Audit",
    color: "border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50/30",
    iconBg: "bg-indigo-100 text-indigo-800",
  },
];

const dashboardPaths = {
  EMPLOYEE: "/employee",
  DIRECTOR: "/director",
  ACCOUNTS: "/accounts",
};

export default function DevQuickLogin() {
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState(null);
  const [error, setError] = useState("");

  async function handleQuickLogin(role) {
    if (loadingRole) return;

    try {
      setLoadingRole(role);
      setError("");

      const data = await apiRequest("/auth/demo-login", {
        method: "POST",
        body: JSON.stringify({ role }),
      });

      if (!data.token || !data.user || data.user.role !== role) {
        throw new Error("Invalid demo login response.");
      }

      localStorage.setItem("evms_token", data.token);
      localStorage.setItem("evms_user", JSON.stringify(data.user));

      navigate(dashboardPaths[role], { replace: true });
    } catch (err) {
      setError(
        err.message || "Demo login is unavailable. Please use normal sign-in.",
      );
    } finally {
      setLoadingRole(null);
    }
  }

  return (
    <div className="mt-8 border-t border-slate-200 pt-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles size={15} className="text-emerald-700" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Quick Demo Login
          </span>
        </div>

        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
          Demo Accounts
        </span>
      </div>

      <p className="mb-3 text-xs text-slate-500">
        Explore the application using a sample account for each role.
      </p>

      <div className="grid grid-cols-1 gap-2.5">
        {accounts.map((account) => {
          const Icon = account.icon;
          const isLoading = loadingRole === account.role;

          return (
            <button
              key={account.role}
              type="button"
              disabled={!!loadingRole}
              onClick={() => handleQuickLogin(account.role)}
              className={`group flex items-center justify-between rounded-xl border bg-white p-3 text-left shadow-sm transition-all disabled:opacity-50 ${account.color}`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${account.iconBg}`}
                >
                  <Icon size={18} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {account.title}
                    </span>
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                      {account.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Sample workspace</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                <span>{isLoading ? "Signing in..." : "Explore"}</span>
                <ArrowRight size={14} />
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
