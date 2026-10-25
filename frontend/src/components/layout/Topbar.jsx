import { useState } from "react";
import { Menu, Bell, Shield, LogOut, CheckCircle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/authService";

const roleDisplay = {
  EMPLOYEE: { title: "Employee", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  DIRECTOR: { title: "Director", color: "bg-amber-50 text-amber-700 border-amber-200" },
  ACCOUNTS: { title: "Accounts Team", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
};

export default function Topbar({
  user,
  title,
  subtitle,
  onMenuClick,
  actions,
}) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const currentRole = roleDisplay[user?.role] ?? roleDisplay.EMPLOYEE;

  function handleLogout() {
    logoutUser();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="flex min-h-18 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile trigger & Page Info */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              {title}
            </h1>
            {subtitle && (
              <p className="hidden text-xs text-slate-500 sm:block truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions, Role Badge, Notifications, User */}
        <div className="flex shrink-0 items-center gap-3">
          {actions}

          {/* Role Pill */}
          <div
            className={`hidden items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold sm:flex ${currentRole.color}`}
          >
            <Shield size={12} />
            <span>{currentRole.title}</span>
          </div>

          {/* Notifications Dropdown Preview */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Notifications
                  </h4>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                    LIVE
                  </span>
                </div>
                <div className="py-3 space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5">
                    <CheckCircle size={15} className="text-emerald-700 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">EVMS System Active</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Logged in as {user?.name || user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 pt-2 border-t border-slate-100"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* Quick Sign Out */}
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out of EVMS"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
