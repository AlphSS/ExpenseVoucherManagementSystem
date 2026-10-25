import { useCallback, useEffect, useState } from "react";
import {
  Receipt,
  Download,
  Printer,
  Search,
  Filter,
  Calendar,
  Building,
  User,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatCard from "../components/dashboard/StatCard";
import StatusBadge from "../components/vouchers/StatusBadge";
import VoucherDetailModal from "../components/vouchers/VoucherDetailModal";
import Button from "../components/ui/Button";
import LoadingState from "../components/ui/LoadingState";
import { apiRequest } from "../services/api";

function formatINR(amount) {
  if (amount == null) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export default function AccountsDashboard() {
  const [vouchers, setVouchers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters state
  const [status, setStatus] = useState("");
  const [department, setDepartment] = useState("");
  const [voucherNumber, setVoucherNumber] = useState("");
  const [employee, setEmployee] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  // Selected Voucher for deep audit inspection
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadVouchers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (department) params.append("department", department);
      if (voucherNumber) params.append("voucherNumber", voucherNumber);
      if (employee) params.append("employee", employee);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("page", String(page));
      params.append("limit", "10");

      const response = await apiRequest(`/accounts/vouchers?${params.toString()}`);
      setVouchers(response.vouchers || []);
      setPagination(
        response.pagination || {
          page,
          limit: 10,
          total: response.vouchers?.length || 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      setError(err.message || "Failed to load accounts ledger.");
    } finally {
      setLoading(false);
    }
  }, [status, department, voucherNumber, employee, startDate, endDate, page]);

  useEffect(() => {
    loadVouchers();
  }, [loadVouchers]);

  // Deep voucher inspection with audit trail
  async function handleInspectVoucher(voucher) {
    setLoadingDetail(true);
    try {
      const res = await apiRequest(`/accounts/vouchers/${voucher.id}`);
      setSelectedVoucher(res.voucher || voucher);
    } catch {
      // Fallback to local voucher if detail endpoint errors
      setSelectedVoucher(voucher);
    } finally {
      setLoadingDetail(false);
    }
  }

  // Export CSV simulation
  function handleExportCSV() {
    if (!vouchers.length) return;
    const headers = [
      "Voucher Number",
      "Employee",
      "Department",
      "Title",
      "Category",
      "Expense Date",
      "Amount (INR)",
      "Status",
    ];
    const rows = vouchers.map((v) => [
      `"${v.voucher_number || v.id}"`,
      `"${v.employee_name || v.employee_email}"`,
      `"${v.department}"`,
      `"${v.expense_title}"`,
      `"${v.expense_category}"`,
      `"${v.expense_date}"`,
      v.amount,
      `"${v.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `evms_accounts_ledger_page_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleResetFilters() {
    setStatus("");
    setDepartment("");
    setVoucherNumber("");
    setEmployee("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  }

  // Calculate local page aggregates
  const pageTotalAmount = vouchers.reduce(
    (acc, v) => acc + (Number(v.amount) || 0),
    0
  );
  const approvedTotalAmount = vouchers
    .filter((v) => v.status === "APPROVED")
    .reduce((acc, v) => acc + (Number(v.amount) || 0), 0);

  return (
    <AppLayout
      title="Accounts & Audit Center"
      subtitle="Comprehensive corporate expenditure ledger, filterable audit trails, and reconciliation."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadVouchers}
            loading={loading}
            icon={RefreshCw}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            disabled={vouchers.length === 0}
            icon={Download}
          >
            Export CSV
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Header */}
        <DashboardHeader
          badge="FINANCIAL RECONCILIATION"
          title="Corporate Expenditure Ledger"
          subtitle="Audit all voucher submissions, inspect Director approval signatures, and generate financial reports."
        />

        {/* 4 Stats Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Ledger Records"
            value={pagination.total}
            description="Across all historical cycles"
            icon={Receipt}
            tone="indigo"
          />
          <StatCard
            title="Current Page Expenditure"
            value={formatINR(pageTotalAmount)}
            description={`${vouchers.length} claims on this page`}
            icon={FileText}
            tone="slate"
          />
          <StatCard
            title="Approved for Payout"
            value={formatINR(approvedTotalAmount)}
            description="Eligible for bank disbursement"
            icon={CheckCircle2}
            tone="emerald"
          />
          <StatCard
            title="Active Ledger Page"
            value={`${pagination.page} / ${pagination.totalPages || 1}`}
            description={`Limit: ${pagination.limit} records / page`}
            icon={SlidersHorizontal}
            tone="amber"
          />
        </section>

        {/* Multi-Dimensional Filter Bar */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-emerald-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Ledger Query Filters
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
            {/* Voucher # Search */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Voucher #
              </label>
              <input
                type="text"
                value={voucherNumber}
                onChange={(e) => {
                  setVoucherNumber(e.target.value);
                  setPage(1);
                }}
                placeholder="e.g. EV-000001"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
              />
            </div>

            {/* Employee Search */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Employee (Name / ID)
              </label>
              <input
                type="text"
                value={employee}
                onChange={(e) => {
                  setEmployee(e.target.value);
                  setPage(1);
                }}
                placeholder="Name, email, code..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setPage(1);
                }}
                placeholder="e.g. Engineering"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-emerald-500"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </section>

        {/* Ledger Table Section */}
        <section className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <LoadingState text="Compiling ledger records..." rows={6} />
          ) : vouchers.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Receipt size={26} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                No matching ledger entries
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-xs text-slate-500">
                No vouchers match the configured filter parameters. Try expanding your search date or resetting filters.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-6"
                onClick={handleResetFilters}
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-xs">
                <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Voucher ID</th>
                    <th className="px-6 py-3.5">Claimant</th>
                    <th className="px-6 py-3.5">Department & Purpose</th>
                    <th className="px-6 py-3.5">Expense Date</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Audit</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {vouchers.map((voucher) => (
                    <tr
                      key={voucher.id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      onClick={() => handleInspectVoucher(voucher)}
                    >
                      <td className="px-6 py-4 font-mono-numbers font-bold text-slate-900 whitespace-nowrap">
                        {voucher.voucher_number || `EV-${String(voucher.id).padStart(6, "0")}`}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 text-sm">
                          {voucher.employee_name || "Employee"}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {voucher.employee_email} {voucher.employee_code && `• ID: ${voucher.employee_code}`}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {voucher.expense_title}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {voucher.department} • {voucher.expense_category}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        {voucher.expense_date
                          ? new Date(voucher.expense_date).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-6 py-4 font-mono-numbers font-bold text-slate-900 text-sm whitespace-nowrap">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(Number(voucher.amount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={voucher.status} />
                      </td>
                      <td
                        className="px-6 py-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="secondary"
                          size="xs"
                          icon={Eye}
                          onClick={() => handleInspectVoucher(voucher)}
                        >
                          Audit Slip
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-xs">
              <span className="text-slate-500">
                Showing page <strong>{pagination.page}</strong> of{" "}
                <strong>{pagination.totalPages}</strong> ({pagination.total} total vouchers)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="xs"
                  icon={ChevronLeft}
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>

                <Button
                  variant="secondary"
                  size="xs"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                >
                  <span>Next</span>
                  <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Voucher Detail Modal with Audit Trail & Printable Slip */}
      {selectedVoucher && (
        <VoucherDetailModal
          voucher={selectedVoucher}
          isOpen={!!selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
          role="ACCOUNTS"
        />
      )}
    </AppLayout>
  );
}
