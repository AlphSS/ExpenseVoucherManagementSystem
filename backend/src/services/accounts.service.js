import pool from "../config/db.js";
import cloudinary from "../config/cloudinary.js";

const ALLOWED_STATUSES = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED"];

function getSignatureUrl(publicId) {
  if (!publicId) return null;

  return cloudinary.url(publicId, {
    secure: true,
    sign_url: true,
    type: "authenticated",
    resource_type: "image",
  });
}

function buildFilters(filters) {
  const conditions = [];
  const values = [];

  function addCondition(sql, value) {
    values.push(value);
    conditions.push(sql.replace("?", `$${values.length}`));
  }

  if (filters.status) {
    addCondition("v.status = ?", filters.status);
  }

  if (filters.department) {
    addCondition("v.department ILIKE ?", `%${filters.department}%`);
  }

  if (filters.voucherNumber) {
    addCondition("v.voucher_number ILIKE ?", `%${filters.voucherNumber}%`);
  }

  if (filters.employee) {
    values.push(`%${filters.employee}%`);
    const n = values.length;

    conditions.push(
      `(u.name ILIKE $${n}
        OR u.email ILIKE $${n}
        OR COALESCE(u.employee_id, '') ILIKE $${n})`,
    );
  }

  if (filters.startDate) {
    addCondition("v.voucher_date >= ?::date", filters.startDate);
  }

  if (filters.endDate) {
    addCondition("v.voucher_date <= ?::date", filters.endDate);
  }

  return {
    where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    values,
  };
}

export async function getAllAccountsVouchers(filters) {
  const { where, values } = buildFilters(filters);

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const offset = (page - 1) * limit;

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM vouchers v
     JOIN users u ON u.id = v.employee_id
     ${where}`,
    values,
  );

  const total = countResult.rows[0].total;

  const result = await pool.query(
    `SELECT
       v.id,
       v.voucher_number,
       v.employee_id,
       u.name AS employee_name,
       u.employee_id AS employee_code,
       u.email AS employee_email,
       v.voucher_date,
       v.expense_date,
       v.department,
       v.expense_title,
       v.expense_category,
       v.description,
       v.amount,
       v.status,
       v.approval_date,
       v.rejection_reason,
       v.employee_signature_path,
       v.director_signature_path,
       v.created_at,
       v.updated_at
     FROM vouchers v
     JOIN users u ON u.id = v.employee_id
     ${where}
     ORDER BY v.created_at DESC
     LIMIT $${values.length + 1}
     OFFSET $${values.length + 2}`,
    [...values, limit, offset],
  );

  const vouchers = result.rows.map((voucher) => ({
    ...voucher,
    employee_signature_url: getSignatureUrl(voucher.employee_signature_path),
    director_signature_url: getSignatureUrl(voucher.director_signature_path),
    employee_signature_path: undefined,
    director_signature_path: undefined,
  }));

  return {
    vouchers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAccountsVoucherById(voucherId) {
  const result = await pool.query(
    `SELECT
       v.*,
       u.name AS employee_name,
       u.employee_id AS employee_code,
       u.email AS employee_email,
       u.department AS employee_department
     FROM vouchers v
     JOIN users u ON u.id = v.employee_id
     WHERE v.id = $1`,
    [voucherId],
  );

  if (result.rowCount === 0) {
    const error = new Error("Voucher not found.");
    error.status = 404;
    throw error;
  }

  const voucher = result.rows[0];

  const historyResult = await pool.query(
    `SELECT
       h.id,
       h.action,
       h.old_status,
       h.new_status,
       h.remarks,
       h.created_at,
       u.name AS actor_name,
       u.role AS actor_role
     FROM voucher_history h
     JOIN users u ON u.id = h.actor_id
     WHERE h.voucher_id = $1
     ORDER BY h.created_at ASC`,
    [voucherId],
  );

  return {
    ...voucher,
    employee_signature_url: getSignatureUrl(voucher.employee_signature_path),
    director_signature_url: getSignatureUrl(voucher.director_signature_path),
    employee_signature_path: undefined,
    director_signature_path: undefined,
    history: historyResult.rows,
  };
}
