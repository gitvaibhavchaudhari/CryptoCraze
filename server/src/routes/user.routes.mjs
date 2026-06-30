import { Router } from "express";
import { getUserProfile, upsertUser } from "../controllers/user.controller.mjs";
import { asyncHandler } from "../utils/asyncHandler.mjs";

const router = Router();

router.get("/:email", asyncHandler(getUserProfile));
router.post("/sync", asyncHandler(upsertUser));

export default router;
