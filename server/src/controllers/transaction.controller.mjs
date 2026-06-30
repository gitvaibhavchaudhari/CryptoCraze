import { isDatabaseReady } from "../config/database.mjs";
import { createTransactionRecord, listTransactionRecords } from "../models/Transaction.mjs";

export async function listTransactions(request, response) {
  if (!isDatabaseReady()) {
    response.json({ transactions: [] });
    return;
  }

  const transactions = await listTransactionRecords(request.query.userId);
  response.json({ transactions });
}

export async function createTransaction(request, response) {
  if (!isDatabaseReady()) {
    response.status(503).json({ error: "Firebase Firestore is not configured." });
    return;
  }

  const transaction = await createTransactionRecord(request.body);
  response.status(201).json({ transaction });
}
