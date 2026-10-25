import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

import {
  listAccountsVouchers,
  getAccountsVoucher,
} from "../controllers/accounts.controller.js";

const router = Router();

router.use(authenticate, authorizeRole("ACCOUNTS"));

router.get("/vouchers", listAccountsVouchers);
router.get("/vouchers/:id", getAccountsVoucher);

export default router;
