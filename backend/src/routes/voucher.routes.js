import { Router } from "express";
import {
  createVoucher,
  listMyVouchers,
  updateVoucher,
  deleteVoucher,
} from "../controllers/voucher.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import upload from "../middleware/uploadSignature.js";
import {
  uploadSignature,
  submitVoucherController,
} from "../controllers/voucher.controller.js";

const router = Router();

// Every route in this file requires an authenticated employee.
router.use(authenticate, authorizeRole("EMPLOYEE"));

router.post("/", createVoucher);
router.get("/my", listMyVouchers);
router.put("/:id", updateVoucher);
router.delete("/:id", deleteVoucher);
router.post("/:id/signature", upload.single("signature"), uploadSignature);
router.post("/:id/submit", submitVoucherController);

export default router;
