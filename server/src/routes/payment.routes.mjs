import { Router } from "express";
import {
  createPaymentOrder,
  recordPaymentFailure,
  verifyPayment
} from "../controllers/payment.controller.mjs";
import { asyncHandler } from "../utils/asyncHandler.mjs";

const router = Router();

router.post("/create-order", asyncHandler(createPaymentOrder));
router.post("/verify", asyncHandler(verifyPayment));
router.post("/failure", asyncHandler(recordPaymentFailure));

export default router;
