import { fileTypeFromBuffer } from "file-type";
import cloudinary from "../config/cloudinary.js";
import pool from "../config/db.js";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function uploadToCloudinary(buffer, format, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        type: "authenticated",
        folder: "expense-voucher/signatures",
        public_id: publicId,
        overwrite: false,
        format,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(buffer);
  });
}

export async function uploadEmployeeSignature(employeeId, voucherId, file) {
  // Check ownership and status before sending anything to Cloudinary.
  const existing = await pool.query(
    `SELECT id
     FROM vouchers
     WHERE id = $1
       AND employee_id = $2
       AND status = 'DRAFT'`,
    [voucherId, employeeId],
  );

  if (existing.rowCount === 0) {
    const error = new Error("Draft voucher not found or cannot be modified.");
    error.status = 404;
    throw error;
  }

  const detected = await fileTypeFromBuffer(file.buffer);

  if (!detected || !allowedTypes.has(detected.mime)) {
    const error = new Error(
      "The file contents must be a valid JPEG, PNG, or WebP image.",
    );
    error.status = 400;
    throw error;
  }

  const publicId = `employee-${employeeId}-voucher-${voucherId}-${Date.now()}`;

  const uploaded = await uploadToCloudinary(
    file.buffer,
    detected.ext,
    publicId,
  );

  try {
    const updated = await pool.query(
      `UPDATE vouchers
       SET employee_signature_path = $1,
           updated_at = NOW()
       WHERE id = $2
         AND employee_id = $3
         AND status = 'DRAFT'
       RETURNING id, voucher_number, status`,
      [uploaded.public_id, voucherId, employeeId],
    );

    if (updated.rowCount === 0) {
      const error = new Error("Draft voucher changed or cannot be modified.");
      error.status = 409;
      throw error;
    }

    return {
      voucher: updated.rows[0],
      signature: {
        publicId: uploaded.public_id,
        format: uploaded.format,
      },
    };
  } catch (error) {
    // Avoid leaving an unused signature asset if the DB update fails.
    try {
      await cloudinary.uploader.destroy(uploaded.public_id, {
        resource_type: "image",
        type: "authenticated",
      });
    } catch (cleanupError) {
      console.error(
        "Could not clean up uploaded signature:",
        cleanupError.message,
      );
    }

    throw error;
  }
}
