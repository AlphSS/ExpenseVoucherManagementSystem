import {
  getAllAccountsVouchers,
  getAccountsVoucherById,
} from "../services/accounts.service.js";

const ALLOWED_STATUSES = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED"];

export async function listAccountsVouchers(req, res, next) {
  try {
    const {
      status,
      department,
      voucherNumber,
      employee,
      startDate,
      endDate,
      page = "1",
      limit = "10",
    } = req.query;

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid voucher status.",
      });
    }

    if (
      !/^[1-9]\d*$/.test(String(page)) ||
      !/^[1-9]\d*$/.test(String(limit)) ||
      Number(page) > 1000000 ||
      Number(limit) > 100
    ) {
      return res.status(400).json({
        message: "Page must be positive and limit must be between 1 and 100.",
      });
    }

    const validDate = (value) =>
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
      new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

    if (
      (startDate && !validDate(startDate)) ||
      (endDate && !validDate(endDate))
    ) {
      return res.status(400).json({
        message: "Dates must use the YYYY-MM-DD format.",
      });
    }

    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        message: "startDate cannot be later than endDate.",
      });
    }

    const result = await getAllAccountsVouchers({
      status,
      department,
      voucherNumber,
      employee,
      startDate,
      endDate,
      page,
      limit,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAccountsVoucher(req, res, next) {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        message: "Invalid voucher ID.",
      });
    }

    const voucher = await getAccountsVoucherById(id);

    return res.status(200).json({ voucher });
  } catch (error) {
    next(error);
  }
}
