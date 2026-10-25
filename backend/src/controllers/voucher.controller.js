import {
  createVoucher as createVoucherService,
  getMyVouchers,
  updateDraftVoucher,
  deleteDraftVoucher,
} from "../services/voucher.service.js";
import { uploadEmployeeSignature } from "../services/signature.service.js";
import { submitVoucher } from "../services/voucherSubmission.service.js";

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export async function createVoucher(req, res, next) {
  try {
    const {
      expenseDate,
      department,
      expenseTitle,
      expenseCategory,
      description,
      amount,
    } = req.body ?? {};

    if (
      typeof department !== "string" ||
      !department.trim() ||
      typeof expenseTitle !== "string" ||
      !expenseTitle.trim() ||
      typeof expenseCategory !== "string" ||
      !expenseCategory.trim() ||
      !isValidDate(expenseDate) ||
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      (description !== undefined &&
        description !== null &&
        typeof description !== "string")
    ) {
      return res.status(400).json({
        message:
          "Provide a valid expense date, department, title, category and positive amount.",
      });
    }

    if (
      department.trim().length > 100 ||
      expenseTitle.trim().length > 200 ||
      expenseCategory.trim().length > 100
    ) {
      return res.status(400).json({
        message: "One or more fields exceed the allowed length.",
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      description.length > 5000
    ) {
      return res.status(400).json({
        message: "Description is too long.",
      });
    }

    // Convert to a decimal string for PostgreSQL NUMERIC.
    // Avoid unnecessary floating-point calculations.
    const amountString = String(amount).trim();

    if (!/^\d+(\.\d{1,2})?$/.test(amountString)) {
      return res.status(400).json({
        message: "Amount must have at most two decimal places.",
      });
    }
    console.log("Submitting voucher:", {
      ...form,
      amount: Number(form.amount),
    });

    const voucher = await createVoucherService(req.user.id, {
      expenseDate,
      department,
      expenseTitle,
      expenseCategory,
      description,
      amount: amountString,
    });

    return res.status(201).json({
      message: "Draft voucher created successfully.",
      voucher,
    });
  } catch (error) {
    next(error);
  }
}

export async function listMyVouchers(req, res, next) {
  try {
    const vouchers = await getMyVouchers(req.user.id);

    return res.status(200).json({
      count: vouchers.length,
      vouchers,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateVoucher(req, res, next) {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        message: "Invalid voucher ID",
      });
    }

    const {
      expenseDate,
      department,
      expenseTitle,
      expenseCategory,
      description,
      amount,
    } = req.body ?? {};

    if (
      !isValidDate(expenseDate) ||
      typeof department !== "string" ||
      !department.trim() ||
      department.trim().length > 100 ||
      typeof expenseTitle !== "string" ||
      !expenseTitle.trim() ||
      expenseTitle.trim().length > 200 ||
      typeof expenseCategory !== "string" ||
      !expenseCategory.trim() ||
      expenseCategory.trim().length > 100 ||
      (description != null &&
        (typeof description !== "string" || description.length > 5000)) ||
      !["string", "number"].includes(typeof amount) ||
      !/^\d+(\.\d{1,2})?$/.test(String(amount).trim()) ||
      Number(amount) <= 0 ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) >= 10000000000
    ) {
      return res.status(400).json({
        message: "Invalid voucher details",
      });
    }

    const voucher = await updateDraftVoucher(req.user.id, id, {
      expenseDate,
      department,
      expenseTitle,
      expenseCategory,
      description,
      amount: String(amount).trim(),
    });

    if (!voucher) {
      return res.status(404).json({
        message: "Draft voucher not found or cannot be modified",
      });
    }

    return res.status(200).json({
      message: "Draft voucher updated successfully",
      voucher,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteVoucher(req, res, next) {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        message: "Invalid voucher ID",
      });
    }

    const deleted = await deleteDraftVoucher(req.user.id, id);

    if (!deleted) {
      return res.status(404).json({
        message: "Draft voucher not found or cannot be deleted",
      });
    }

    return res.status(200).json({
      message: "Draft voucher deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadSignature(req, res, next) {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({ message: "Invalid voucher ID." });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Signature image is required in the 'signature' field.",
      });
    }

    const result = await uploadEmployeeSignature(req.user.id, id, req.file);

    return res.status(200).json({
      message: "Employee signature uploaded successfully.",
      voucher: result.voucher,
      signature: result.signature,
    });
  } catch (error) {
    next(error);
  }
}

export async function submitVoucherController(req, res, next) {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({ message: "Invalid voucher ID." });
    }

    const voucher = await submitVoucher(req.user.id, id);

    return res.status(200).json({
      message: "Voucher submitted for approval successfully.",
      voucher,
    });
  } catch (error) {
    next(error);
  }
}
