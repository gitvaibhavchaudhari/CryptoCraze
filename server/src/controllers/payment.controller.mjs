import crypto from "node:crypto";
import { isDatabaseReady } from "../config/database.mjs";
import { env } from "../config/env.mjs";
import {
  createTransactionRecord,
  findTransactionById,
  updateTransactionById,
  updateTransactionByOrderId
} from "../models/Transaction.mjs";
import { httpError } from "../utils/httpError.mjs";

const allowedPaymentMethods = new Set(["card", "upi", "netbanking", "wallet"]);
const databaseOperationTimeoutMs = 12000;
const razorpayOrderTimeoutMs = 15000;

function assertDatabaseReady() {
  if (!isDatabaseReady()) {
    throw httpError(503, "Firebase Firestore is required before creating payment orders.");
  }
}

function getRazorpayClient() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    throw httpError(503, "Razorpay keys are not configured.");
  }
}

function withTimeout(promise, timeoutMs, message) {
  let timeout;

  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timeout = setTimeout(() => reject(httpError(503, message)), timeoutMs);
    })
  ]).finally(() => clearTimeout(timeout));
}

async function createRazorpayOrder(payload) {
  getRazorpayClient();

  const authHeader = Buffer.from(`${env.razorpayKeyId}:${env.razorpayKeySecret}`).toString("base64");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), razorpayOrderTimeoutMs);

  let razorpayResponse;

  try {
    razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } catch (error) {
    const message =
      error.name === "AbortError"
        ? "Razorpay did not respond in time. Please try again."
        : error.message || "Unable to reach Razorpay.";
    throw httpError(502, message);
  } finally {
    clearTimeout(timeout);
  }

  const responseBody = await razorpayResponse.json().catch(() => ({}));

  if (!razorpayResponse.ok) {
    throw httpError(
      razorpayResponse.status,
      responseBody.error?.description || "Unable to create Razorpay order."
    );
  }

  return responseBody;
}

async function createTransactionOrThrow(payload) {
  try {
    return await withTimeout(
      createTransactionRecord(payload),
      databaseOperationTimeoutMs,
      "Firestore did not respond while saving the payment transaction."
    );
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw httpError(
      503,
      `Unable to save payment transaction. Check Firestore service account permissions. ${error.message || ""}`.trim()
    );
  }
}

async function updateTransactionOrThrow(transactionId, patch) {
  try {
    return await withTimeout(
      updateTransactionById(transactionId, patch),
      databaseOperationTimeoutMs,
      "Firestore did not respond while updating the payment transaction."
    );
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw httpError(
      503,
      `Unable to update payment transaction. Check Firestore service account permissions. ${error.message || ""}`.trim()
    );
  }
}

function validateOrderPayload(payload) {
  const requiredFields = ["userId", "coinId", "coinName", "coinSymbol", "quantity", "fiatAmount", "paymentMethod"];
  const missingField = requiredFields.find((field) => payload[field] === undefined || payload[field] === "");

  if (missingField) {
    throw httpError(400, `${missingField} is required.`);
  }

  if (!allowedPaymentMethods.has(payload.paymentMethod)) {
    throw httpError(400, "Unsupported payment method.");
  }

  if (Number(payload.fiatAmount) <= 0 || Number(payload.quantity) <= 0) {
    throw httpError(400, "Amount and quantity must be greater than zero.");
  }
}

function safeSignatureCompare(expectedSignature, receivedSignature) {
  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(receivedSignature);

  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

export async function createPaymentOrder(request, response) {
  assertDatabaseReady();
  validateOrderPayload(request.body);

  const currency = request.body.currency || "INR";
  const amountInSubunits = Math.round(Number(request.body.fiatAmount) * 100);
  const transaction = await createTransactionOrThrow({
    userId: request.body.userId,
    userEmail: request.body.userEmail,
    coinId: request.body.coinId,
    coinName: request.body.coinName,
    coinSymbol: request.body.coinSymbol,
    quantity: Number(request.body.quantity),
    fiatAmount: Number(request.body.fiatAmount),
    currency,
    paymentMethod: request.body.paymentMethod,
    status: "initiated"
  });

  let order;

  try {
    order = await createRazorpayOrder({
      amount: amountInSubunits,
      currency,
      receipt: `cc_${transaction._id}`,
      notes: {
        transactionId: transaction._id,
        userId: request.body.userId,
        coinId: request.body.coinId,
        paymentMethod: request.body.paymentMethod
      }
    });
  } catch (error) {
    await updateTransactionById(transaction._id, {
      status: "failed",
      providerErrorDescription: error.message,
      failedAt: new Date().toISOString()
    }).catch(() => {});
    throw error;
  }

  const updatedTransaction = await updateTransactionOrThrow(transaction._id, {
    providerOrderId: order.id,
    status: "created"
  });

  response.status(201).json({
    keyId: env.razorpayKeyId,
    order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency
    },
    transactionId: updatedTransaction._id
  });
}

export async function verifyPayment(request, response) {
  assertDatabaseReady();

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, transactionId } = request.body;

  if (!transactionId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw httpError(400, "Payment verification details are required.");
  }

  if (!env.razorpayKeySecret) {
    throw httpError(503, "Razorpay secret is not configured.");
  }

  const transaction = await findTransactionById(transactionId);

  if (!transaction) {
    throw httpError(404, "Transaction was not found.");
  }

  if (transaction.providerOrderId !== razorpay_order_id) {
    throw httpError(400, "Payment order does not match this transaction.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const verified = safeSignatureCompare(expectedSignature, razorpay_signature);

  const updatedTransaction = await updateTransactionById(transactionId, {
    providerPaymentId: razorpay_payment_id,
    providerSignature: razorpay_signature,
    status: verified ? "success" : "failed",
    verifiedAt: verified ? new Date().toISOString() : null,
    failedAt: verified ? null : new Date().toISOString()
  });

  if (!verified) {
    throw httpError(400, "Payment verification failed.");
  }

  response.json({
    status: "success",
    message: "Payment verified successfully.",
    transaction: updatedTransaction
  });
}

export async function recordPaymentFailure(request, response) {
  assertDatabaseReady();

  const { error = {}, razorpay_order_id, transactionId } = request.body;

  if (!transactionId && !razorpay_order_id) {
    throw httpError(400, "Transaction id or Razorpay order id is required.");
  }

  const patch = {
    status: "failed",
    providerErrorCode: error.code,
    providerErrorDescription: error.description,
    providerErrorSource: error.source,
    providerErrorStep: error.step,
    providerErrorReason: error.reason,
    failedAt: new Date().toISOString()
  };
  const transaction = transactionId
    ? await updateTransactionById(transactionId, patch)
    : await updateTransactionByOrderId(razorpay_order_id, patch);

  if (!transaction) {
    throw httpError(404, "Transaction was not found.");
  }

  response.json({
    status: "failed",
    message: "Payment failure recorded.",
    transaction
  });
}
