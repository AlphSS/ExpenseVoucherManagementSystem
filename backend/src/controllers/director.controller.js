import {
  getPendingVouchers,
  getAllVouchers,
} from "../services/director.service.js";
import {
  approveVoucher,
  rejectVoucher,
} from "../services/directorApproval.service.js";

export async function listPendingVouchers(req, res, next) {
  try {
    const vouchers = await getPendingVouchers();

    return res.status(200).json({
      count: vouchers.length,
      vouchers,
    });
  } catch (error) {
    next(error);
  }
}

export async function listAllVouchers(req, res, next) {
  try {
    const vouchers = await getAllVouchers();

    return res.status(200).json({
      count: vouchers.length,
      vouchers,
    });
  } catch (error) {
    next(error);
  }
}

export async function approveVoucherController(req, res, next) {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({ message: "Invalid voucher ID." });
    }

    const voucher = await approveVoucher(id, req.user.id, req.file);

    return res.status(200).json({
      message: "Voucher approved successfully.",
      voucher,
    });
  } catch (error) {
    next(error);
  }
}

export async function rejectVoucherController(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({ message: "Invalid voucher ID." });
    }

    const voucher = await rejectVoucher(id, req.user.id, reason);

    return res.status(200).json({
      message: "Voucher rejected successfully.",
      voucher,
    });
  } catch (error) {
    next(error);
  }
}
