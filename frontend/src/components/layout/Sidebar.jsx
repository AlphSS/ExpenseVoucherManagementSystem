import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Clock,
  CheckCircle2,
  Receipt,
  FilePlus,
  ShieldCheck,
  Building,
  LogOut,
  X,
  CreditCard,
  History,
} from "lucide-react";
import { logoutUser } from "../../services/authService";

const navigation = {
  EMPLOYEE: [
    { label: "Dashboard", path: "/employee", icon: LayoutDashboard },
    { label: "New Voucher", path: "/employee/vouchers/new", icon: FilePlus },
  ],
  DIRECTOR: [
    { label: "Approval Queue", path: "/director", icon: Clock },
  ],
  ACCOUNTS: [
    { label: "Finance & Audit", path: "/accounts", icon: Receipt },
  ],
};

const roleInfo = {
  EMPLOYEE: {
    label: "Employee Portal",
    badge: "EXPENSE CLAIMANT",
    color: "from-emerald-500 to-teal-600",
  },
  DIRECTOR: {
    label: "Director Portal",
    badge: "APPROVAL AUTHORITY",
    color: "from-amber-500 to-orange-600",
  },
  ACCOUNTS: {
    label: "Accounts Portal",
    badge: "FINANCE & AUDIT",
    color: "from-indigo-500 to-violet-600",
  },
};

export default function Sidebar({ user, open = false, onClose }) {
  const navigate = useNavigate();
  const role = user?.role || "EMPLOYEE";
  const items = navigation[role] ?? [];
  const currentRole = roleInfo[role] ?? roleInfo.EMPLOYEE;

  function handleSignOut() {
    logoutUser();
    navigate("/login", { replace: true });
  }

  return (
    <>
      {open && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close navigation"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onClose();
            }
          }}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col
          border-r border-slate-800 bg-slate-950 text-slate-200 transition-transform duration-200 ease-in-out
          lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-800/80 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <CreditCard size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white">
                  NexVoucher
                </span>
                <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                  EVMS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Expense Management</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Role Workspace Banner */}
        <div className="px-5 py-4 border-b border-slate-800/50">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {currentRole.badge}
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="mt-1 text-sm font-semibold text-white">
              {currentRole.label}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-4">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Main Navigation
          </p>
          {items.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/employee" || path === "/director" || path === "/accounts"}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-xs"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`
              }
            >
              <Icon size={18} className="transition-transform group-hover:scale-105" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Sign Out Footer */}
        <div className="border-t border-slate-800 p-4 bg-slate-900/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-sm font-bold text-emerald-400 border border-slate-700">
                {(user?.name || user?.email || "U").trim().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">
                  {user?.name || "Active User"}
                </p>
                <p className="truncate text-[11px] text-slate-400">
                  {user?.email || ""}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
