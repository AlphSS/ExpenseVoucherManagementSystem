import { useCallback, useEffect, useState } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  Eye,
  RefreshCw,
  ShieldCheck,
  Building,
  Calendar,
  AlertTriangle,
  Send,
  PenTool,
  Check,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatCard from "../components/dashboard/StatCard";
import StatusBadge from "../components/vouchers/StatusBadge";
import VoucherDetailModal from "../components/vouchers/VoucherDetailModal";
import SignatureUpload from "../components/ui/SignatureUpload";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import LoadingState from "../components/ui/LoadingState";
import { apiRequest } from "../services/api";

function formatCurrency(amount) {
  if (amount == null) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

const quickRejectionTemplates = [
  "Missing itemized tax invoice or receipts.",
  "Amount exceeds approved department travel budget.",
  "Expense category is outside reimbursable policy guidelines.",
  "Duplicate claim for the same expense date.",
];

export default function DirectorDashboard() {
  const [activeTab, setActiveTab] = useState("PENDING"); // 'PENDING' | 'ALL'
  const [pendingVouchers, setPendingVouchers] = useState([]);
  const [allVouchers, setAllVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  // Modals
  const [inspectVoucher, setInspectVoucher] = useState(null);
  const [approvingVoucher, setApprovingVoucher] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [isApproving, setIsApproving] = useState(false);

  const [rejectingVoucher, setRejectingVoucher] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const [toast, setToast] = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [pendingRes, allRes] = await Promise.all([
        apiRequest("/director/vouchers/pending"),
        apiRequest("/director/vouchers"),
      ]);

      setPendingVouchers(pendingRes.vouchers || []);
      setAllVouchers(allRes.vouchers || []);
    } catch (err) {
      setError(err.message || "Failed to load vouchers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived metrics
  const pendingTotal = pendingVouchers.reduce(
    (acc, v) => acc + (Number(v.amount) || 0),
    0
  );
  const approvedTotal = allVouchers
    .filter((v) => v.status === "APPROVED")
    .reduce((acc, v) => acc + (Number(v.amount) || 0), 0);
  const rejectedCount = allVouchers.filter((v) => v.status === "REJECTED").length;

  const currentList = activeTab === "PENDING" ? pendingVouchers : allVouchers;

  // Filter list
  const filteredList = currentList.filter((v) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      v.voucher_number?.toLowerCase().includes(term) ||
      v.expense_title?.toLowerCase().includes(term) ||
      v.department?.toLowerCase().includes(term) ||
      v.employee_name?.toLowerCase().includes(term) ||
      v.employee_email?.toLowerCase().includes(term);

    const matchesDept =
      departmentFilter === "ALL" || v.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  const uniqueDepartments = Array.from(
    new Set(allVouchers.map((v) => v.department).filter(Boolean))
  );

  // Approve Handler
  async function handleApprove() {
    if (!approvingVoucher) return;
    if (!signatureFile) {
      alert("Please provide the Director digital signature to approve.");
      return;
    }

    setIsApproving(true);
    try {
      const formData = new FormData();
      formData.append("signature", signatureFile);

      await apiRequest(`/director/vouchers/${approvingVoucher.id}/approve`, {
        method: "POST",
        body: formData,
      });

      showToast(`Voucher ${approvingVoucher.voucher_number || `#${approvingVoucher.id}`} approved successfully!`);
      setApprovingVoucher(null);
      setSignatureFile(null);
      if (inspectVoucher?.id === approvingVoucher.id) {
        setInspectVoucher(null);
      }
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to approve voucher.");
    } finally {
      setIsApproving(false);
    }
  }

  // Reject Handler
  async function handleReject() {
    if (!rejectingVoucher) return;
    if (!rejectionReason.trim()) {
      alert("A specific rejection reason is required.");
      return;
    }

    setIsRejecting(true);
    try {
      await apiRequest(`/director/vouchers/${rejectingVoucher.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });

      showToast(`Voucher ${rejectingVoucher.voucher_number || `#${rejectingVoucher.id}`} rejected with feedback.`);
      setRejectingVoucher(null);
      setRejectionReason("");
      if (inspectVoucher?.id === rejectingVoucher.id) {
        setInspectVoucher(null);
      }
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to reject voucher.");
    } finally {
      setIsRejecting(false);
    }
  }

  return (
    <AppLayout
      title="Director Approval Center"
      subtitle="Review pending employee expense vouchers, verify claims, and provide cryptographic sign-off."
      actions={
        <Button variant="secondary" size="sm" onClick={loadData} loading={loading} icon={RefreshCw}>
          Refresh Queue
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Toast */}
        {toast && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-md flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-700" />
              {toast.msg}
            </span>
            <button type="button" onClick={() => setToast(null)} className="text-emerald-700 hover:text-emerald-900">
              ✕
            </button>
          </div>
        )}

        {/* Dashboard Header */}
        <DashboardHeader
          badge="EXECUTIVE AUTHORITY"
          title="Executive Approval Command"
          subtitle="Manage organizational expense authorizations with high-fidelity digital signatures and policy compliance."
        />

        {/* Top 4 Stats Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Awaiting Decision"
            value={pendingVouchers.length}
            description={`Pending liability: ${formatCurrency(pendingTotal)}`}
            icon={Clock}
            tone="amber"
          />
          <StatCard
            title="Approved Volume"
            value={formatCurrency(approvedTotal)}
            description="Total authorized reimbursements"
            icon={CheckCircle2}
            tone="emerald"
          />
          <StatCard
            title="Total Audited Claims"
            value={allVouchers.length}
            description="Across all corporate departments"
            icon={FileText}
            tone="indigo"
          />
          <StatCard
            title="Rejected Claims"
            value={rejectedCount}
            description="Claims flagged for policy revision"
            icon={XCircle}
            tone="rose"
          />
        </section>

        {/* Main List Section */}
        <section className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          {/* Tabs & Filters */}
          <div className="border-b border-slate-100 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Queue Switcher */}
              <div className="flex p-1 rounded-xl bg-slate-100 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("PENDING")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === "PENDING"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Clock size={14} className={pendingVouchers.length ? "text-amber-600 animate-pulse" : ""} />
                  <span>Pending Review ({pendingVouchers.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ALL")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === "ALL"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText size={14} />
                  <span>All Vouchers ({allVouchers.length})</span>
                </button>
              </div>

              {/* Department Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Department:</span>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Departments</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search claims by voucher #, employee name, title, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          {/* Table Content */}
          {loading ? (
            <LoadingState text="Loading vouchers for Director review..." rows={5} />
          ) : filteredList.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <CheckCircle2 size={26} className="text-emerald-700" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                {activeTab === "PENDING"
                  ? "Pending review queue is completely clear!"
                  : "No vouchers match your filter criteria."}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-xs text-slate-500">
                {activeTab === "PENDING"
                  ? "All submitted claims have been addressed. New vouchers will appear here when submitted by employees."
                  : "Try clearing your search query or department filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-xs">
                <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Voucher ID</th>
                    <th className="px-6 py-3.5">Employee & Dept</th>
                    <th className="px-6 py-3.5">Expense Details</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Decision Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredList.map((voucher) => (
                    <tr
                      key={voucher.id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      onClick={() => setInspectVoucher(voucher)}
                    >
                      <td className="px-6 py-4 font-mono-numbers font-bold text-slate-900 whitespace-nowrap">
                        {voucher.voucher_number || `EV-${String(voucher.id).padStart(6, "0")}`}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 text-sm">
                          {voucher.employee_name || voucher.employee_email || "Employee"}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {voucher.department} {voucher.employee_code && `• ${voucher.employee_code}`}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {voucher.expense_title}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {voucher.expense_category}
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
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Eye}
                            onClick={() => setInspectVoucher(voucher)}
                          >
                            Inspect
                          </Button>

                          {voucher.status === "PENDING_APPROVAL" && (
                            <>
                              <Button
                                variant="dangerOutline"
                                size="xs"
                                icon={XCircle}
                                onClick={() => setRejectingVoucher(voucher)}
                              >
                                Reject
                              </Button>

                              <Button
                                variant="primary"
                                size="xs"
                                icon={ShieldCheck}
                                onClick={() => setApprovingVoucher(voucher)}
                              >
                                Sign & Approve
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Comprehensive Voucher Inspection Modal */}
      {inspectVoucher && (
        <VoucherDetailModal
          voucher={inspectVoucher}
          isOpen={!!inspectVoucher}
          onClose={() => setInspectVoucher(null)}
          role="DIRECTOR"
          onOpenApprove={(v) => setApprovingVoucher(v)}
          onOpenReject={(v) => setRejectingVoucher(v)}
        />
      )}

      {/* Director Sign & Approve Modal */}
      {approvingVoucher && (
        <Modal
          isOpen={!!approvingVoucher}
          onClose={() => {
            setApprovingVoucher(null);
            setSignatureFile(null);
          }}
          title="Director Approval & Digital Seal"
          subtitle={`Approve voucher ${approvingVoucher.voucher_number || `#${approvingVoucher.id}`} for payment disbursement`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-6">
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600">Claimant:</span>
                <span className="font-bold text-slate-900">
                  {approvingVoucher.employee_name || approvingVoucher.employee_email}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600">Department & Category:</span>
                <span className="font-medium text-slate-800">
                  {approvingVoucher.department} • {approvingVoucher.expense_category}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/60">
                <span className="font-semibold text-slate-600">Authorized Reimbursement:</span>
                <span className="font-mono-numbers font-bold text-emerald-800 text-sm">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(Number(approvingVoucher.amount))}
                </span>
              </div>
            </div>

            <SignatureUpload
              roleLabel="Director"
              onSignatureReady={(file) => setSignatureFile(file)}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setApprovingVoucher(null);
                  setSignatureFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Check}
                loading={isApproving}
                onClick={handleApprove}
              >
                Confirm Approval & Stamp
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Director Reject Modal */}
      {rejectingVoucher && (
        <Modal
          isOpen={!!rejectingVoucher}
          onClose={() => {
            setRejectingVoucher(null);
            setRejectionReason("");
          }}
          title="Reject Expense Claim"
          subtitle={`Provide constructive feedback for ${rejectingVoucher.voucher_number || `#${rejectingVoucher.id}`}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Please specify the reason this expense claim cannot be approved at this time:
            </p>

            {/* Quick Reason Chips */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Policy Remarks
              </span>
              <div className="space-y-1.5">
                {quickRejectionTemplates.map((template) => (
                  <button
                    key={template}
                    type="button"
                    onClick={() => setRejectionReason(template)}
                    className="w-full text-left text-xs p-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 transition-colors text-slate-700"
                  >
                    • {template}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Detailed Rejection Remarks <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Specify the policy violation or missing documents..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 outline-none focus:border-rose-500 focus:ring-3 focus:ring-rose-500/10"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setRejectingVoucher(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={XCircle}
                loading={isRejecting}
                onClick={handleReject}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
