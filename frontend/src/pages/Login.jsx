import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  FileCheck2,
  Lock,
  Mail,
  Zap,
} from "lucide-react";
import { loginUser } from "../services/authService";
import DevQuickLogin from "../components/auth/DevQuickLogin";
import Button from "../components/ui/Button";

function getDashboardPath(role) {
  switch (role) {
    case "EMPLOYEE":
      return "/employee";
    case "DIRECTOR":
      return "/director";
    case "ACCOUNTS":
      return "/accounts";
    default:
      return null;
  }
}

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(loginEmail, loginPassword) {
    setLoading(true);
    setError("");

    try {
      const user = await loginUser(loginEmail, loginPassword);
      const destination = getDashboardPath(user.role);

      if (!destination) {
        throw new Error("Your account has an unrecognized role.");
      }

      navigate(destination, { replace: true });
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await handleLogin(email, password);
    } catch (err) {
      setError(err.message || "Login failed. Please verify your credentials.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col lg:grid lg:grid-cols-12">
      {/* Left Hero Section */}
      <section className="relative hidden lg:flex lg:col-span-7 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-12 xl:p-16 text-white border-r border-slate-800">
        {/* Ambient decorative lights */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 font-bold">
            <CreditCard size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                NexVoucher
              </span>
              <span className="rounded-md bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                ENTERPRISE
              </span>
            </div>
            <p className="text-xs text-slate-400">Expense Voucher Management System</p>
          </div>
        </div>

        {/* Middle Value Proposition & Floating Preview Card */}
        <div className="relative z-10 my-10 max-w-xl space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 mb-6">
              <Zap size={14} className="text-emerald-400" />
              <span>Next-Gen Enterprise Accounting</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight xl:text-5xl leading-[1.15]">
              Flawless expense control. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                One unified ledger.
              </span>
            </h1>

            <p className="mt-5 text-base text-slate-300 leading-relaxed">
              Empower employees to submit claims instantly, provide directors with one-tap digital signature approvals, and equip finance teams with verifiable audit trails.
            </p>
          </div>

          {/* Floating Live Voucher Simulation Mock Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="text-emerald-400" size={20} />
                <div>
                  <p className="text-xs font-mono font-bold text-slate-200">EV-000492</p>
                  <p className="text-[11px] text-slate-400">Engineering • Cloud Infrastructure</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 size={12} /> Approved
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">Amount Claimed</p>
                <p className="text-2xl font-bold font-mono text-white mt-0.5">₹48,250.00</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">Director Signature</p>
                <p className="text-xs font-semibold text-emerald-300 flex items-center justify-end gap-1 mt-0.5">
                  <ShieldCheck size={14} /> Cryptographically Signed
                </p>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="border-l border-emerald-500/40 pl-3">
              <p className="text-lg font-bold text-white font-mono">100%</p>
              <p className="text-xs text-slate-400 mt-0.5">Digital & Paperless</p>
            </div>
            <div className="border-l border-emerald-500/40 pl-3">
              <p className="text-lg font-bold text-white font-mono">3 Roles</p>
              <p className="text-xs text-slate-400 mt-0.5">Employee, Director, Accounts</p>
            </div>
            <div className="border-l border-emerald-500/40 pl-3">
              <p className="text-lg font-bold text-white font-mono">Real-time</p>
              <p className="text-xs text-slate-400 mt-0.5">Voucher Reconciliation</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-6">
          <span>NexVoucher Enterprise EVMS</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck size={14} className="text-emerald-400" /> End-to-end audited
          </span>
        </div>
      </section>

      {/* Right Login Section */}
      <section className="flex-1 lg:col-span-5 flex min-h-screen items-center justify-center p-6 sm:p-10 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-bold">
              <CreditCard size={20} />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900">NexVoucher</span>
              <p className="text-xs text-slate-500">Enterprise EVMS</p>
            </div>
          </div>

          {/* Title */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Secure Access
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Sign in to EVMS
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter your corporate credentials to manage vouchers and approvals.
            </p>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Work Email
              </label>
              <div className="relative rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@example.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 font-medium"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
              icon={ArrowRight}
            >
              Sign in to Portal
            </Button>
          </form>

          {/* Quick Login for Dev Personas */}
          <DevQuickLogin onLogin={handleLogin} />

          <p className="mt-8 text-center text-xs text-slate-400">
            Internal Authorized System. All interactions are monitored and audited.
          </p>
        </div>
      </section>
    </main>
  );
}
