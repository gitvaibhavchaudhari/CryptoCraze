import { getDatabase } from "../config/database.mjs";

const USERS_COLLECTION = "userProfiles";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function getUserDocumentId({ email, firebaseUid }) {
  return firebaseUid || encodeURIComponent(normalizeEmail(email));
}

function serializeUser(snapshot) {
  if (!snapshot.exists) {
    return null;
  }

  return {
    _id: snapshot.id,
    id: snapshot.id,
    ...snapshot.data()
  };
}

export async function upsertUserProfile(payload) {
  const db = getDatabase();
  const now = new Date().toISOString();
  const email = normalizeEmail(payload.email);
  const userRef = db.collection(USERS_COLLECTION).doc(getUserDocumentId(payload));
  const existing = await userRef.get();

  await userRef.set(
    {
      firebaseUid: payload.firebaseUid || null,
      fullName: String(payload.fullName || "").trim(),
      email,
      role: existing.exists ? existing.data().role : "user",
      status: existing.exists ? existing.data().status : "active",
      createdAt: existing.exists ? existing.data().createdAt : now,
      updatedAt: now
    },
    { merge: true }
  );

  return serializeUser(await userRef.get());
}

export async function findUserProfileByEmail(email) {
  const db = getDatabase();
  const snapshot = await db
    .collection(USERS_COLLECTION)
    .where("email", "==", normalizeEmail(email))
    .limit(1)
    .get();

  return snapshot.empty ? null : serializeUser(snapshot.docs[0]);
}
