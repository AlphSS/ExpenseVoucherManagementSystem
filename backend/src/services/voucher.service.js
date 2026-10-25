import pool from "../config/db.js";

export async function createVoucher(employeeId, data) {
  const {
    expenseDate,
    department,
    expenseTitle,
    expenseCategory,
    description,
    amount,
  } = data;

  const result = await pool.query(
    `INSERT INTO vouchers (
       employee_id,
       expense_date,
       department,
       expense_title,
       expense_category,
       description,
       amount
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING
       id,
       voucher_number,
       employee_id,
       voucher_date,
       expense_date,
       department,
       expense_title,
       expense_category,
       description,
       amount,
       status,
       created_at`,
    [
      employeeId,
      expenseDate,
      department.trim(),
      expenseTitle.trim(),
      expenseCategory.trim(),
      description?.trim() || null,
      amount,
    ],
  );

  return result.rows[0];
}

export async function getMyVouchers(employeeId) {
  const result = await pool.query(
    `SELECT
       id,
       voucher_number,
       voucher_date,
       expense_date,
       department,
       expense_title,
       expense_category,
       amount,
       status,
       created_at,
       updated_at
     FROM vouchers
     WHERE employee_id = $1
     ORDER BY created_at DESC`,
    [employeeId],
  );

  return result.rows;
}

export async function updateDraftVoucher(employeeId, voucherId, data) {
  const {
    expenseDate,
    department,
    expenseTitle,
    expenseCategory,
    description,
    amount,
  } = data;

  const result = await pool.query(
    `UPDATE vouchers
     SET expense_date = $1,
         department = $2,
         expense_title = $3,
         expense_category = $4,
         description = $5,
         amount = $6,
         updated_at = NOW()
     WHERE id = $7
       AND employee_id = $8
       AND status = 'DRAFT'
     RETURNING *`,
    [
      expenseDate,
      department.trim(),
      expenseTitle.trim(),
      expenseCategory.trim(),
      description?.trim() || null,
      amount,
      voucherId,
      employeeId,
    ]
  );

  return result.rows[0] || null;
}

export async function deleteDraftVoucher(employeeId, voucherId) {
  const result = await pool.query(
    `DELETE FROM vouchers
     WHERE id = $1
       AND employee_id = $2
       AND status = 'DRAFT'
     RETURNING id`,
    [voucherId, employeeId]
  );

  return result.rows[0] || null;
}