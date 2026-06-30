import { Router } from "express";
import { createTransaction, listTransactions } from "../controllers/transaction.controller.mjs";
import { asyncHandler } from "../utils/asyncHandler.mjs";

const router = Router();

router.get("/", asyncHandler(listTransactions));
router.post("/", asyncHandler(createTransaction));

export default router;
