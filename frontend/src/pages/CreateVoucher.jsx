import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FilePlus2,
  Save,
  Plane,
  Utensils,
  Hotel,
  Briefcase,
  Laptop,
  PhoneCall,
  MoreHorizontal,
  Calendar,
  Building,
  CreditCard,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import Button from "../components/ui/Button";
import { apiRequest } from "../services/api";

const initialForm = {
  voucherDate: new Date().toISOString().slice(0, 10),
  expenseDate: new Date().toISOString().slice(0, 10),
  department: "Engineering",
  expenseTitle: "",
  expenseCategory: "Office Supplies",
  description: "",
  amount: "",
};

const categories = [
  { name: "Travel", icon: Plane, desc: "Flights, cab, train, fuel" },
  { name: "Food", icon: Utensils, desc: "Team meals, client dining" },
  { name: "Accommodation", icon: Hotel, desc: "Hotels, lodging, stay" },
  { name: "Office Supplies", icon: Briefcase, desc: "Stationery, materials" },
  { name: "Equipment", icon: Laptop, desc: "Hardware, tools, gadgets" },
  { name: "Communication", icon: PhoneCall, desc: "Internet, phone bills" },
  { name: "Other", icon: MoreHorizontal, desc: "Miscellaneous expense" },
];

const departments = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Operations",
  "Finance & Legal",
  "Human Resources",
];

export default function CreateVoucher() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const parsedAmount = Number(form.amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid expense amount greater than zero.");
      return;
    }

    if (!form.expenseTitle.trim()) {
      setError("Please provide an expense title.");
      return;
    }

    if (!form.department.trim()) {
      setError("Please select or enter a department.");
      return;
    }

    setSaving(true);

    try {
      // Backend expects camelCase keys and amount with 2 decimal places
      const payload = {
        expenseDate: form.expenseDate,
        department: form.department.trim(),
        expenseTitle: form.expenseTitle.trim(),
        expenseCategory: form.expenseCategory,
        description: form.description.trim(),
        amount: parsedAmount.toFixed(2),
      };

      console.log("Voucher request payload:", payload);

      await apiRequest("/vouchers", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      navigate("/employee");
    } catch (err) {
      setError(
        err.message || "Unable to save the voucher. Please check your entries.",
      );
    } finally {
      setSaving(false);
    }
  }

  const selectedCategoryObj =
    categories.find((c) => c.name === form.expenseCategory) || categories[0];

  return (
    <AppLayout
      title="Create Expense Voucher"
      subtitle="Draft a new corporate expense claim with category details and business justification."
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Back navigation */}
        <button
          type="button"
          onClick={() => navigate("/employee")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Employee Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form (7 cols) */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-slate-100 p-6 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <FilePlus2 size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Expense Claim Details
                  </h2>
                  <p className="text-xs text-slate-500">
                    All drafts can be reviewed and digitally signed before
                    sending to the Director.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800"
                >
                  {error}
                </div>
              )}

              {/* 1. Category Tiles Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                  Expense Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = form.expenseCategory === cat.name;

                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            expenseCategory: cat.name,
                          }))
                        }
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/40 text-emerald-950 font-bold shadow-2xs ring-2 ring-emerald-500/20"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/60"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg mb-1.5 ${
                            isSelected
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <span className="text-xs">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Amount Input with large focus */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Expense Amount (INR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-2xl border-2 border-slate-200 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all overflow-hidden bg-white shadow-2xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 pr-3 border-r border-slate-200 bg-slate-50 text-slate-500 font-bold text-lg">
                    ₹
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                    className="w-full pl-14 pr-4 py-3.5 text-xl font-bold font-mono-numbers text-slate-900 outline-none placeholder:text-slate-300"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Enter the exact invoice amount including applicable taxes.
                </p>
              </div>

              {/* 3. Title & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Expense Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="expenseTitle"
                    value={form.expenseTitle}
                    onChange={handleChange}
                    placeholder="e.g. Client Dinner - Q3 Kickoff"
                    maxLength={200}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/10"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Date of Expense <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="expenseDate"
                    value={form.expenseDate}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Voucher Submission Date
                  </label>
                  <input
                    type="date"
                    name="voucherDate"
                    value={form.voucherDate}
                    onChange={handleChange}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* 5. Purpose & Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Business Justification & Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={2000}
                  placeholder="Detail the business purpose of this expenditure, client/project context, or itemized notes..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/10"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-100">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate("/employee")}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={Save}
                  loading={saving}
                  disabled={saving}
                >
                  Save Draft Voucher
                </Button>
              </div>
            </form>
          </div>

          {/* Right Live Preview Card (5 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Live Draft Preview
                    </span>
                  </div>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                    DRAFT
                  </span>
                </div>

                <div className="my-5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Claim Amount
                  </span>
                  <p className="text-3xl font-bold font-mono text-emerald-400 mt-1">
                    {form.amount
                      ? new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(Number(form.amount))
                      : "₹0.00"}
                  </p>
                </div>

                <div className="space-y-3 border-t border-slate-800/80 pt-4 text-xs">
                  <div>
                    <span className="text-slate-400">Title:</span>
                    <p className="font-semibold text-slate-200 mt-0.5">
                      {form.expenseTitle || "Untitled Expense"}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <div>
                      <span className="text-slate-400">Category:</span>
                      <p className="font-semibold text-slate-200 mt-0.5">
                        {form.expenseCategory}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400">Department:</span>
                      <p className="font-semibold text-slate-200 mt-0.5">
                        {form.department}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400">Expense Date:</span>
                    <p className="font-semibold text-slate-200 mt-0.5">
                      {form.expenseDate}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-slate-900 border border-slate-800 p-3 text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-semibold">Note:</span>{" "}
                  Saving creates an official draft voucher in your employee
                  ledger. You will be able to digitally sign it before it
                  reaches the Director.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
