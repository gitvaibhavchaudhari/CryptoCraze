import { Router } from "express";

const router = Router();

router.post("/session", (request, response) => {
  response.json({
    status: "ready",
    message: "Attach Firebase Admin or JWT verification middleware here for production sessions."
  });
});

router.post("/logout", (request, response) => {
  response.json({ status: "success" });
});

export default router;
