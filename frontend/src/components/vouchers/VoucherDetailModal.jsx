import { useState } from "react";
import {
  Printer,
  Calendar,
  Building,
  Tag,
  FileText,
  User,
  ShieldCheck,
  AlertTriangle,
  Send,
  Trash2,
  CheckCircle2,
  XCircle,
  FileCheck,
} from "lucide-react";
import Modal from "../ui/Modal";
import StatusBadge from "./StatusBadge";
import Button from "../ui/Button";

function formatCurrency(amount) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function VoucherDetailModal({
  voucher,
  isOpen,
  onClose,
  role = "EMPLOYEE",
  onSubmitVoucher,
  onOpenApprove,
  onOpenReject,
  onDeleteVoucher,
  onOpenSignature,
}) {
  const [submitting, setSubmitting] = useState(false);

  if (!voucher) return null;

  async function handlePrint() {
    window.print();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      title={
        <div className="flex items-center gap-3">
          <span className="font-mono-numbers font-bold text-slate-900">
            {voucher.voucher_number || `Voucher #${voucher.id}`}
          </span>
          <StatusBadge status={voucher.status} />
        </div>
      }
      subtitle={`Created on ${formatDate(voucher.created_at || voucher.voucher_date)}`}
    >
      <div className="space-y-6 printable-voucher">
        {/* Printable Header - hidden normally, visible in print */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">EXPENSE VOUCHER</h1>
              <p className="text-xs text-slate-600">Enterprise Expense Management System</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{voucher.voucher_number}</p>
              <p className="text-xs">{formatDate(voucher.voucher_date)}</p>
            </div>
          </div>
        </div>

        {/* Rejection Alert if rejected */}
        {voucher.status === "REJECTED" && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-rose-900">
            <AlertTriangle className="mt-0.5 shrink-0 text-rose-600" size={19} />
            <div className="text-sm">
              <p className="font-bold text-rose-900">Rejection Reason</p>
              <p className="mt-1 text-rose-800 leading-relaxed">
                {voucher.rejection_reason || "No detailed remarks provided."}
              </p>
              <p className="mt-2 text-xs text-rose-600">
                You can create a new revised draft incorporating this feedback.
              </p>
            </div>
          </div>
        )}

        {/* Key Expense Metrics Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50/80 to-white p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Expense Amount
              </span>
              <p className="text-3xl font-bold text-emerald-800 font-mono-numbers mt-1">
                {formatCurrency(voucher.amount)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
                <Calendar size={14} className="text-slate-400" />
                <span>Expense: <strong>{formatDate(voucher.expense_date)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
                <Building size={14} className="text-slate-400" />
                <span>Dept: <strong>{voucher.department}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
                <Tag size={14} className="text-slate-400" />
                <span>Category: <strong>{voucher.expense_category}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Purpose & Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Expense Title & Purpose
          </h4>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h5 className="font-semibold text-slate-900 text-base">
              {voucher.expense_title}
            </h5>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {voucher.description || "No detailed description provided."}
            </p>
          </div>
        </div>

        {/* Employee Info */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-700 font-bold text-sm">
                {(voucher.employee_name || voucher.employee_email || "E")[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {voucher.employee_name || "Employee"}
                </p>
                <p className="text-xs text-slate-500">
                  {voucher.employee_email} {voucher.employee_code && `• ID: ${voucher.employee_code}`}
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              Department: <strong className="text-slate-800">{voucher.department}</strong>
            </div>
          </div>
        </div>

        {/* Digital Signatures Verification Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Digital Signatures & Approvals
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Employee Signature */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600">Employee Signature</span>
                {voucher.employee_signature_url || voucher.employee_signature_path ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                    <ShieldCheck size={14} /> Signed
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-amber-700">Pending Signature</span>
                )}
              </div>

              {voucher.employee_signature_url ? (
                <div className="h-24 w-full rounded-xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center overflow-hidden">
                  <img
                    src={voucher.employee_signature_url}
                    alt="Employee Signature"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : voucher.employee_signature_path ? (
                <div className="h-24 w-full rounded-xl bg-emerald-50/40 border border-emerald-100 p-2 flex items-center justify-center text-xs text-emerald-800 font-medium">
                  <FileCheck size={16} className="mr-1.5" /> Signature on File
                </div>
              ) : (
                <div className="h-24 w-full rounded-xl bg-slate-50 border border-dashed border-slate-200 p-2 flex flex-col items-center justify-center text-xs text-slate-400">
                  <span>No signature uploaded yet</span>
                  {role === "EMPLOYEE" && voucher.status === "DRAFT" && (
                    <button
                      type="button"
                      onClick={() => onOpenSignature?.(voucher)}
                      className="mt-2 text-xs font-semibold text-emerald-800 hover:underline"
                    >
                      + Add signature now
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Director Approval Signature */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600">Director Approval</span>
                {voucher.status === "APPROVED" ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                    <ShieldCheck size={14} /> Approved
                  </span>
                ) : voucher.status === "REJECTED" ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                    <XCircle size={14} /> Rejected
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-amber-700">Awaiting Decision</span>
                )}
              </div>

              {voucher.director_signature_url ? (
                <div className="h-24 w-full rounded-xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center overflow-hidden">
                  <img
                    src={voucher.director_signature_url}
                    alt="Director Signature"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : voucher.director_signature_path ? (
                <div className="h-24 w-full rounded-xl bg-emerald-50/40 border border-emerald-100 p-2 flex items-center justify-center text-xs text-emerald-800 font-medium">
                  <FileCheck size={16} className="mr-1.5" /> Director Approved
                </div>
              ) : voucher.status === "REJECTED" ? (
                <div className="h-24 w-full rounded-xl bg-rose-50/40 border border-rose-200 p-2 flex flex-col items-center justify-center text-xs text-rose-700">
                  <XCircle size={20} className="mb-1 text-rose-500" />
                  <span>Voucher Rejected by Director</span>
                </div>
              ) : (
                <div className="h-24 w-full rounded-xl bg-slate-50 border border-dashed border-slate-200 p-2 flex items-center justify-center text-xs text-slate-400">
                  Pending Director review
                </div>
              )}

              {voucher.approval_date && (
                <p className="mt-2 text-right text-[11px] text-slate-400">
                  Approved on {formatDate(voucher.approval_date)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Audit History (if available, e.g. from Accounts view) */}
        {voucher.history && voucher.history.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Voucher Audit Trail
            </h4>
            <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
              {voucher.history.map((entry, index) => (
                <div key={index} className="p-3 text-xs flex items-start justify-between gap-3">
                  <div>
                    <span className="font-semibold text-slate-800">{entry.action}</span>
                    <span className="text-slate-500"> by </span>
                    <span className="font-medium text-slate-700">{entry.actor_name}</span>
                    <span className="text-slate-400 text-[10px]"> ({entry.actor_role})</span>
                    {entry.remarks && (
                      <p className="mt-1 text-slate-600 bg-slate-50 p-2 rounded-lg italic">
                        "{entry.remarks}"
                      </p>
                    )}
                  </div>
                  <span className="text-slate-400 whitespace-nowrap">
                    {formatDate(entry.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions Bar */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 no-print">
          <Button variant="secondary" size="sm" onClick={handlePrint} icon={Printer}>
            Print / Export Slip
          </Button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Employee Draft Actions */}
            {role === "EMPLOYEE" && voucher.status === "DRAFT" && (
              <>
                <Button
                  variant="dangerOutline"
                  size="sm"
                  icon={Trash2}
                  onClick={() => onDeleteVoucher?.(voucher)}
                >
                  Delete
                </Button>

                {(!voucher.employee_signature_url && !voucher.employee_signature_path) ? (
                  <Button
                    variant="indigo"
                    size="sm"
                    icon={FileCheck}
                    onClick={() => onOpenSignature?.(voucher)}
                  >
                    Sign Voucher
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Send}
                    loading={submitting}
                    onClick={async () => {
                      setSubmitting(true);
                      await onSubmitVoucher?.(voucher);
                      setSubmitting(false);
                    }}
                  >
                    Submit for Approval
                  </Button>
                )}
              </>
            )}

            {/* Director Actions */}
            {role === "DIRECTOR" && voucher.status === "PENDING_APPROVAL" && (
              <>
                <Button
                  variant="dangerOutline"
                  size="sm"
                  icon={XCircle}
                  onClick={() => onOpenReject?.(voucher)}
                >
                  Reject Voucher
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  onClick={() => onOpenApprove?.(voucher)}
                >
                  Sign & Approve
                </Button>
              </>
            )}

            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
