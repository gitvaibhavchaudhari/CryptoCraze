import { getDatabase } from "../config/database.mjs";

const TRANSACTIONS_COLLECTION = "transactions";

function serializeTransaction(snapshot) {
  if (!snapshot.exists) {
    return null;
  }

  return {
    _id: snapshot.id,
    id: snapshot.id,
    ...snapshot.data()
  };
}

function normalizeTransactionPayload(payload) {
  return {
    ...payload,
    userEmail: String(payload.userEmail || "").trim().toLowerCase(),
    coinSymbol: String(payload.coinSymbol || "").trim().toLowerCase(),
    quantity: Number(payload.quantity),
    fiatAmount: Number(payload.fiatAmount),
    currency: payload.currency || "INR",
    provider: payload.provider || "razorpay",
    status: payload.status || "created"
  };
}

export async function listTransactionRecords(userId) {
  const db = getDatabase();
  const collection = db.collection(TRANSACTIONS_COLLECTION);
  const snapshot = userId
    ? await collection.where("userId", "==", userId).get()
    : await collection.orderBy("createdAt", "desc").limit(50).get();

  return snapshot.docs
    .map(serializeTransaction)
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
    .slice(0, 50);
}

export async function createTransactionRecord(payload) {
  const db = getDatabase();
  const now = new Date().toISOString();
  const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc();
  const transaction = {
    ...normalizeTransactionPayload(payload),
    createdAt: now,
    updatedAt: now
  };

  await transactionRef.set(transaction);

  return {
    _id: transactionRef.id,
    id: transactionRef.id,
    ...transaction
  };
}

export async function findTransactionById(transactionId) {
  const db = getDatabase();
  return serializeTransaction(await db.collection(TRANSACTIONS_COLLECTION).doc(transactionId).get());
}

export async function updateTransactionById(transactionId, patch) {
  const db = getDatabase();
  const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc(transactionId);
  const existing = await transactionRef.get();

  if (!existing.exists) {
    return null;
  }

  await transactionRef.set(
    {
      ...patch,
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );

  return serializeTransaction(await transactionRef.get());
}

export async function updateTransactionByOrderId(providerOrderId, patch) {
  const db = getDatabase();
  const snapshot = await db
    .collection(TRANSACTIONS_COLLECTION)
    .where("providerOrderId", "==", providerOrderId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return updateTransactionById(snapshot.docs[0].id, patch);
}
