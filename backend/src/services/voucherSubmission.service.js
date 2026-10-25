import pool from "../config/db.js";

export async function submitVoucher(employeeId, voucherId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `SELECT
         id,
         voucher_number,
         status,
         department,
         expense_title,
         expense_date,
         amount,
         employee_signature_path
       FROM vouchers
       WHERE id = $1
         AND employee_id = $2
       FOR UPDATE`,
      [voucherId, employeeId],
    );

    if (result.rowCount === 0) {
      const error = new Error("Voucher not found.");
      error.status = 404;
      throw error;
    }

    const voucher = result.rows[0];

    if (voucher.status !== "DRAFT") {
      const error = new Error("Only Draft vouchers can be submitted.");
      error.status = 409;
      throw error;
    }

    if (
      !voucher.department?.trim() ||
      !voucher.expense_title?.trim() ||
      !voucher.expense_date ||
      Number(voucher.amount) <= 0 ||
      !voucher.employee_signature_path
    ) {
      const error = new Error(
        "Voucher requires department, title, expense date, positive amount, and employee signature.",
      );
      error.status = 400;
      throw error;
    }

    const updated = await client.query(
      `UPDATE vouchers
       SET status = 'PENDING_APPROVAL',
           updated_at = NOW()
       WHERE id = $1
         AND employee_id = $2
         AND status = 'DRAFT'
       RETURNING id, voucher_number, status, updated_at`,
      [voucherId, employeeId],
    );

    if (updated.rowCount !== 1) {
      const error = new Error("Voucher could not be submitted.");
      error.status = 409;
      throw error;
    }

    await client.query(
      `INSERT INTO voucher_history
         (voucher_id, actor_id, action, old_status, new_status)
       VALUES ($1, $2, $3, $4, $5)`,
      [voucherId, employeeId, "SUBMITTED", "DRAFT", "PENDING_APPROVAL"],
    );

    await client.query("COMMIT");

    return updated.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
