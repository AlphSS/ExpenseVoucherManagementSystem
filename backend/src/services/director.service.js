import pool from "../config/db.js";

export async function getPendingVouchers() {
  const result = await pool.query(
    `SELECT
       v.id,
       v.voucher_number,
       v.voucher_date,
       v.expense_date,
       v.department,
       v.expense_title,
       v.expense_category,
       v.description,
       v.amount,
       v.status,
       v.employee_signature_path,
       v.created_at,
       u.name AS employee_name,
       u.employee_id AS employee_code
     FROM vouchers v
     JOIN users u ON u.id = v.employee_id
     WHERE v.status = 'PENDING_APPROVAL'
     ORDER BY v.created_at ASC`,
  );

  return result.rows;
}

export async function getAllVouchers() {
  const result = await pool.query(
    `SELECT
       v.id,
       v.voucher_number,
       v.voucher_date,
       v.expense_date,
       v.department,
       v.expense_title,
       v.expense_category,
       v.amount,
       v.status,
       v.created_at,
       v.approval_date,
       v.rejection_reason,
       u.name AS employee_name,
       u.employee_id AS employee_code
     FROM vouchers v
     JOIN users u ON u.id = v.employee_id
     ORDER BY v.created_at DESC`,
  );

  return result.rows;
}
