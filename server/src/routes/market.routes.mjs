import { Router } from "express";
import { proxyCoinGecko } from "../controllers/market.controller.mjs";
import { asyncHandler } from "../utils/asyncHandler.mjs";

const router = Router();

router.get("/*path", asyncHandler(proxyCoinGecko));

export default router;
