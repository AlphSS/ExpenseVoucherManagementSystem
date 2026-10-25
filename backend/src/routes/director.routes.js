import { Router } from "express";
import {
  listPendingVouchers,
  listAllVouchers,
  approveVoucherController,
  rejectVoucherController,
} from "../controllers/director.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import upload from "../middleware/uploadSignature.js";

const router = Router();

router.use(authenticate, authorizeRole("DIRECTOR"));

router.get("/vouchers/pending", listPendingVouchers);
router.get("/vouchers", listAllVouchers);

router.post(
  "/vouchers/:id/approve",
  upload.single("signature"),
  approveVoucherController
);

router.post(
  "/vouchers/:id/reject",
  rejectVoucherController
);

export default router;
