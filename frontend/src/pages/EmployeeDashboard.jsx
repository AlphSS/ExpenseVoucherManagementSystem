import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Search,
  Eye,
  Trash2,
  PenTool,
  Send,
  AlertCircle,
  FileEdit,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatCard from "../components/dashboard/StatCard";
import StatusBadge from "../components/vouchers/StatusBadge";
import VoucherDetailModal from "../components/vouchers/VoucherDetailModal";
import Modal from "../components/ui/Modal";
import SignatureUpload from "../components/ui/SignatureUpload";
import Button from "../components/ui/Button";
import LoadingState from "../components/ui/LoadingState";
import { apiRequest } from "../services/api";

function formatINR(val) {
  if (val == null) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(val));
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("newest"); // 'newest' | 'amount-high' | 'amount-low'

  // Modal states
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [signingVoucher, setSigningVoucher] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [isSubmittingSignature, setIsSubmittingSignature] = useState(false);
  const [deletingVoucher, setDeletingVoucher] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState(null);

  const loadVouchers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/vouchers/my");
      const records = Array.isArray(response)
        ? response
        : (response.vouchers ?? response.data ?? []);

      setVouchers(records);
    } catch (err) {
      setError(err.message || "Unable to retrieve your vouchers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVouchers();
  }, [loadVouchers]);

  function showToast(msg, type = "success") {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  }

  // Count & Amount calculations
  const countByStatus = (status) =>
    vouchers.filter((v) => v.status === status).length;

  const totalAmount = vouchers.reduce(
    (acc, v) => acc + (Number(v.amount) || 0),
    0
  );
  const approvedAmount = vouchers
    .filter((v) => v.status === "APPROVED")
    .reduce((acc, v) => acc + (Number(v.amount) || 0), 0);

  // Filter & Sort
  const filteredVouchers = vouchers
    .filter((voucher) => {
      const matchesStatus =
        statusFilter === "ALL" || voucher.status === statusFilter;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        voucher.voucher_number?.toLowerCase().includes(term) ||
        voucher.expense_title?.toLowerCase().includes(term) ||
        voucher.expense_category?.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.created_at || b.voucher_date) - new Date(a.created_at || a.voucher_date);
      }
      if (sortOrder === "amount-high") {
        return Number(b.amount) - Number(a.amount);
      }
      if (sortOrder === "amount-low") {
        return Number(a.amount) - Number(b.amount);
      }
      return 0;
    });

  // Handle Signature Upload & Submission
  async function handleConfirmSignature() {
    if (!signingVoucher) return;
    if (!signatureFile && !signingVoucher.employee_signature_url && !signingVoucher.employee_signature_path) {
      alert("Please draw or upload your signature before submitting.");
      return;
    }

    setIsSubmittingSignature(true);
    try {
      // 1. Upload signature if a new file was drawn/uploaded
      if (signatureFile) {
        const formData = new FormData();
        formData.append("signature", signatureFile);
        await apiRequest(`/vouchers/${signingVoucher.id}/signature`, {
          method: "POST",
          body: formData,
        });
      }

      // 2. Submit voucher for approval
      await apiRequest(`/vouchers/${signingVoucher.id}/submit`, {
        method: "POST",
      });

      showToast("Voucher signed and submitted to Director successfully!");
      setSigningVoucher(null);
      setSignatureFile(null);
      if (selectedVoucher?.id === signingVoucher.id) {
        setSelectedVoucher(null);
      }
      await loadVouchers();
    } catch (err) {
      alert(err.message || "Failed to submit signature.");
    } finally {
      setIsSubmittingSignature(false);
    }
  }

  // Handle Direct Submission from modal if signature is already present
  async function handleSubmitExisting(voucher) {
    try {
      await apiRequest(`/vouchers/${voucher.id}/submit`, {
        method: "POST",
      });
      showToast("Voucher submitted to Director for approval!");
      setSelectedVoucher(null);
      await loadVouchers();
    } catch (err) {
      alert(err.message || "Failed to submit voucher.");
    }
  }

  // Handle Delete Draft
  async function handleDeleteDraft() {
    if (!deletingVoucher) return;
    setIsDeleting(true);
    try {
      await apiRequest(`/vouchers/${deletingVoucher.id}`, {
        method: "DELETE",
      });
      showToast("Draft voucher removed successfully.");
      setDeletingVoucher(null);
      if (selectedVoucher?.id === deletingVoucher.id) {
        setSelectedVoucher(null);
      }
      await loadVouchers();
    } catch (err) {
      alert(err.message || "Failed to delete voucher.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AppLayout
      title="Employee Portal"
      subtitle="Track your expense claims, sign drafts, and monitor director reviews."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={loadVouchers} loading={loading} icon={RefreshCw}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate("/employee/vouchers/new")} icon={Plus}>
            New Voucher
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Toast alert */}
        {notification && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-md flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-700" />
              {notification.msg}
            </span>
            <button type="button" onClick={() => setNotification(null)} className="text-emerald-700 hover:text-emerald-900">
              ✕
            </button>
          </div>
        )}

        {/* Dashboard Header Banner */}
        <DashboardHeader
          badge="EMPLOYEE WORKSPACE"
          title="Expense Claim Center"
          subtitle="Submit corporate expenses with verified digital signatures and track real-time approval status."
          actions={
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/employee/vouchers/new")}
              icon={Plus}
            >
              Create Expense Voucher
            </Button>
          }
        />

        {/* Top 4 Stats Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Submitted"
            value={vouchers.length}
            description={`Total: ${formatINR(totalAmount)} across all claims`}
            icon={FileText}
            tone="indigo"
          />
          <StatCard
            title="Draft Vouchers"
            value={countByStatus("DRAFT")}
            description="Awaiting signature & submission"
            icon={FileEdit}
            tone="slate"
          />
          <StatCard
            title="Pending Review"
            value={countByStatus("PENDING_APPROVAL")}
            description="Under Director review"
            icon={Clock}
            tone="amber"
          />
          <StatCard
            title="Approved & Reimbursable"
            value={countByStatus("APPROVED")}
            description={`Settled: ${formatINR(approvedAmount)}`}
            icon={CheckCircle2}
            tone="emerald"
          />
        </section>

        {/* Rejection Notification Banner */}
        {countByStatus("REJECTED") > 0 && (
          <section className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <XCircle size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-900">
                  {countByStatus("REJECTED")} Claim(s) Require Attention
                </p>
                <p className="text-xs text-rose-700 mt-0.5">
                  The Director provided feedback on rejected vouchers. Click on any rejected voucher to view remarks and make adjustments.
                </p>
              </div>
            </div>
            <Button
              variant="dangerOutline"
              size="xs"
              onClick={() => setStatusFilter("REJECTED")}
            >
              Filter Rejected
            </Button>
          </section>
        )}

        {/* Main Vouchers Table Card */}
        <section className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          {/* Filters Bar */}
          <div className="border-b border-slate-100 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Status Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 text-xs font-semibold">
                {[
                  { id: "ALL", label: `All (${vouchers.length})` },
                  { id: "DRAFT", label: `Drafts (${countByStatus("DRAFT")})` },
                  { id: "PENDING_APPROVAL", label: `Pending (${countByStatus("PENDING_APPROVAL")})` },
                  { id: "APPROVED", label: `Approved (${countByStatus("APPROVED")})` },
                  { id: "REJECTED", label: `Rejected (${countByStatus("REJECTED")})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      statusFilter === tab.id
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sort Order Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Sort:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500"
                >
                  <option value="newest">Latest First</option>
                  <option value="amount-high">Amount: High to Low</option>
                  <option value="amount-low">Amount: Low to High</option>
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
                placeholder="Search claims by voucher #, purpose title, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          {/* Table Content */}
          {loading ? (
            <LoadingState text="Loading expense claims..." rows={5} />
          ) : filteredVouchers.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                <FileText size={26} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                No vouchers found
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-xs text-slate-500">
                {searchTerm || statusFilter !== "ALL"
                  ? "No vouchers match your filter criteria. Try clearing search or selecting a different status tab."
                  : "You haven't recorded any expense claims yet. Create a draft voucher to get started."}
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-6"
                onClick={() => navigate("/employee/vouchers/new")}
                icon={Plus}
              >
                Create Your First Voucher
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-xs">
                <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Voucher ID</th>
                    <th className="px-6 py-3.5">Expense Details</th>
                    <th className="px-6 py-3.5">Dates</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredVouchers.map((voucher) => (
                    <tr
                      key={voucher.id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedVoucher(voucher)}
                    >
                      <td className="px-6 py-4 font-mono-numbers font-bold text-slate-900 whitespace-nowrap">
                        {voucher.voucher_number || `EV-${String(voucher.id).padStart(6, "0")}`}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 text-sm">
                          {voucher.expense_title}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {voucher.department} • {voucher.expense_category}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-slate-800 font-medium">
                          {voucher.expense_date
                            ? new Date(voucher.expense_date).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Claimed:{" "}
                          {voucher.voucher_date
                            ? new Date(voucher.voucher_date).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </p>
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
                            onClick={() => setSelectedVoucher(voucher)}
                          >
                            View
                          </Button>

                          {voucher.status === "DRAFT" && (
                            <>
                              <Button
                                variant="primary"
                                size="xs"
                                icon={PenTool}
                                onClick={() => {
                                  setSigningVoucher(voucher);
                                }}
                              >
                                Sign & Submit
                              </Button>

                              <button
                                type="button"
                                title="Delete Draft"
                                onClick={() => setDeletingVoucher(voucher)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
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

      {/* Voucher Detail Modal */}
      {selectedVoucher && (
        <VoucherDetailModal
          voucher={selectedVoucher}
          isOpen={!!selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
          role="EMPLOYEE"
          onSubmitVoucher={handleSubmitExisting}
          onOpenSignature={(v) => setSigningVoucher(v)}
          onDeleteVoucher={(v) => setDeletingVoucher(v)}
        />
      )}

      {/* Digital Signature & Submission Modal */}
      {signingVoucher && (
        <Modal
          isOpen={!!signingVoucher}
          onClose={() => {
            setSigningVoucher(null);
            setSignatureFile(null);
          }}
          title="Sign & Submit Expense Claim"
          subtitle={`Attach your authorized signature to voucher ${signingVoucher.voucher_number || `#${signingVoucher.id}`}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-6">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600">Claim Title:</span>
                <span className="font-bold text-slate-900">{signingVoucher.expense_title}</span>
              </div>
              <div className="flex justify-between items-center text-xs mt-2">
                <span className="font-semibold text-slate-600">Claim Amount:</span>
                <span className="font-mono-numbers font-bold text-emerald-800 text-sm">
                  {formatINR(signingVoucher.amount)}
                </span>
              </div>
            </div>

            <SignatureUpload
              roleLabel="Employee"
              currentSignatureUrl={signingVoucher.employee_signature_url}
              onSignatureReady={(file) => setSignatureFile(file)}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSigningVoucher(null);
                  setSignatureFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Send}
                loading={isSubmittingSignature}
                onClick={handleConfirmSignature}
              >
                Sign & Submit for Approval
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingVoucher && (
        <Modal
          isOpen={!!deletingVoucher}
          onClose={() => setDeletingVoucher(null)}
          title="Delete Draft Voucher"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to permanently delete draft voucher{" "}
              <strong>{deletingVoucher.voucher_number || `#${deletingVoucher.id}`}</strong>?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setDeletingVoucher(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={isDeleting}
                onClick={handleDeleteDraft}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
