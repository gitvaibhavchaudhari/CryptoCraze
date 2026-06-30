import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes.mjs";
import marketRoutes from "./routes/market.routes.mjs";
import paymentRoutes from "./routes/payment.routes.mjs";
import transactionRoutes from "./routes/transaction.routes.mjs";
import userRoutes from "./routes/user.routes.mjs";
import { env } from "./config/env.mjs";
import { isDatabaseReady } from "./config/database.mjs";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.appOrigin,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (request, response) => {
    response.json({
      ok: true,
      service: "cryptocraze-api",
      payments: env.razorpayKeyId ? "razorpay-ready" : "configuration-required",
      database: isDatabaseReady() ? "firestore-ready" : "not-configured"
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/coingecko", marketRoutes);

  app.use((request, response) => {
    response.status(404).json({ error: "Route not found." });
  });

  app.use((error, request, response, _next) => {
    void _next;
    console.error(error);
    response.status(error.statusCode || 500).json({
      error: error.message || "Internal server error."
    });
  });

  return app;
}
