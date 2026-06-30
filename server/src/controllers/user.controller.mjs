import { isDatabaseReady } from "../config/database.mjs";
import { findUserProfileByEmail, upsertUserProfile } from "../models/User.mjs";

export async function upsertUser(request, response) {
  if (!isDatabaseReady()) {
    response.status(503).json({ error: "Firebase Firestore is not configured." });
    return;
  }

  const user = await upsertUserProfile(request.body);

  response.json({ user });
}

export async function getUserProfile(request, response) {
  if (!isDatabaseReady()) {
    response.status(503).json({ error: "Firebase Firestore is not configured." });
    return;
  }

  const user = await findUserProfileByEmail(request.params.email);
  response.json({ user });
}
