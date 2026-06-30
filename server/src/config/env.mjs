import "dotenv/config";

export const env = {
  port: Number(process.env.PORT || 8787),
  appOrigin: process.env.APP_ORIGIN || "http://localhost:5173",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "",
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") || "",
  coinGeckoApiBase: process.env.COINGECKO_API_BASE || "https://api.coingecko.com/api/v3",
  coinGeckoProApiKey: process.env.COINGECKO_PRO_API_KEY || "",
  coinGeckoDemoApiKey: process.env.COINGECKO_DEMO_API_KEY || "",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || ""
};
