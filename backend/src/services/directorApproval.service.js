import pool from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import { fileTypeFromBuffer } from "file-type";
import { randomUUID } from "node:crypto";

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function uploadToCloudinary(buffer, format, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "expense-voucher/signatures",
          public_id: publicId,
          resource_type: "image",
          type: "authenticated",
          format,
          overwrite: false,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      )
      .end(buffer);
  });
}

async function deleteCloudinaryAsset(publicId) {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      type: "authenticated",
    });
  } catch (error) {
    console.error("Cloudinary cleanup failed:", error.message);
  }
}

export async function approveVoucher(voucherId, directorId, file) {
  if (!file) {
    const error = new Error("Director signature is required.");
    error.status = 400;
    throw error;
  }

  // Validate the actual file contents, not just its filename or MIME header.
  const detected = await fileTypeFromBuffer(file.buffer);

  if (!detected || !ALLOWED_TYPES[detected.mime]) {
    const error = new Error("Signature must be a JPEG, PNG, or WebP image.");
    error.status = 400;
    throw error;
  }

  // Check status before uploading. We recheck it under a database lock below.
  const check = await pool.query(
    "SELECT id, status FROM vouchers WHERE id = $1",
    [voucherId],
  );

  if (check.rowCount === 0) {
    const error = new Error("Voucher not found.");
    error.status = 404;
    throw error;
  }

  if (check.rows[0].status !== "PENDING_APPROVAL") {
    const error = new Error("Only pending vouchers can be approved.");
    error.status = 409;
    throw error;
  }

  const publicId = `director-${directorId}-voucher-${voucherId}-${randomUUID()}`;

  const uploaded = await uploadToCloudinary(
    file.buffer,
    ALLOWED_TYPES[detected.mime],
    publicId,
  );

  const client = await pool.connect();
  let transactionStarted = false;
  let committed = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    // Lock the voucher and check again to prevent duplicate decisions.
    const result = await client.query(
      "SELECT id, status FROM vouchers WHERE id = $1 FOR UPDATE",
      [voucherId],
    );

    if (result.rowCount === 0) {
      const error = new Error("Voucher not found.");
      error.status = 404;
      throw error;
    }

    if (result.rows[0].status !== "PENDING_APPROVAL") {
      const error = new Error("This voucher has already been processed.");
      error.status = 409;
      throw error;
    }

    const updated = await client.query(
      `UPDATE vouchers
       SET status = 'APPROVED',
           director_signature_path = $1,
           approval_date = NOW(),
           updated_at = NOW()
       WHERE id = $2
       RETURNING id, voucher_number, status, approval_date`,
      [uploaded.public_id, voucherId],
    );

    await client.query(
      `INSERT INTO voucher_history
         (voucher_id, actor_id, action, old_status, new_status)
       VALUES ($1, $2, 'APPROVED', 'PENDING_APPROVAL', 'APPROVED')`,
      [voucherId, directorId],
    );

    await client.query("COMMIT");
    committed = true;

    return updated.rows[0];
  } catch (error) {
    if (transactionStarted && !committed) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError.message);
      }
    }

    // Remove the uploaded image if the database operation failed.
    if (!committed) {
      await deleteCloudinaryAsset(uploaded.public_id);
    }

    throw error;
  } finally {
    client.release();
  }
}

export async function rejectVoucher(voucherId, directorId, reason) {
  const trimmedReason = typeof reason === "string" ? reason.trim() : "";

  if (!trimmedReason || trimmedReason.length > 2000) {
    const error = new Error(
      "A rejection reason is required and must not exceed 2000 characters.",
    );
    error.status = 400;
    throw error;
  }

  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    const result = await client.query(
      "SELECT id, status FROM vouchers WHERE id = $1 FOR UPDATE",
      [voucherId],
    );

    if (result.rowCount === 0) {
      const error = new Error("Voucher not found.");
      error.status = 404;
      throw error;
    }

    if (result.rows[0].status !== "PENDING_APPROVAL") {
      const error = new Error("Only pending vouchers can be rejected.");
      error.status = 409;
      throw error;
    }

    const updated = await client.query(
      `UPDATE vouchers
       SET status = 'REJECTED',
           rejection_reason = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING id, voucher_number, status, rejection_reason, updated_at`,
      [trimmedReason, voucherId],
    );

    await client.query(
      `INSERT INTO voucher_history
         (voucher_id, actor_id, action, old_status, new_status, remarks)
       VALUES ($1, $2, 'REJECTED', 'PENDING_APPROVAL', 'REJECTED', $3)`,
      [voucherId, directorId, trimmedReason],
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return updated.rows[0];
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError.message);
      }
    }

    throw error;
  } finally {
    client.release();
  }
}
