import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { env } from "./env.mjs";

let firestoreDb = null;

function hasServiceAccountCredentials() {
  return Boolean(env.firebaseProjectId && env.firebaseClientEmail && env.firebasePrivateKey);
}

function hasApplicationDefaultCredentials() {
  return Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCLOUD_PROJECT
  );
}

export async function connectDatabase() {
  if (!hasServiceAccountCredentials() && !hasApplicationDefaultCredentials()) {
    console.warn(
      "Firebase Admin credentials are not set. API will run without database persistence."
    );
    return;
  }

  const app =
    getApps()[0] ||
    initializeApp({
      credential: hasServiceAccountCredentials()
        ? cert({
            projectId: env.firebaseProjectId,
            clientEmail: env.firebaseClientEmail,
            privateKey: env.firebasePrivateKey
          })
        : applicationDefault(),
      projectId: env.firebaseProjectId || undefined
    });

  firestoreDb = getFirestore(app);
  console.log("Firebase Firestore connected.");
}

export function isDatabaseReady() {
  return Boolean(firestoreDb);
}

export function getDatabase() {
  if (!firestoreDb) {
    throw new Error("Firebase Firestore is not configured.");
  }

  return firestoreDb;
}
