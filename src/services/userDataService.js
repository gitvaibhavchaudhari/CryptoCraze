import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestoreDb, isFirebaseConfigured } from "../lib/firebase";
import { createInitialUserState, normalizeUserState, safeParseJSON } from "../utils/helpers";

function getStorageKey(uid) {
  return `cryptocraze_user_state_${uid}`;
}

export async function getUserState(user) {
  if (!user) {
    return null;
  }

  if (isFirebaseConfigured) {
    const userRef = doc(firestoreDb, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      const initialState = createInitialUserState(user);
      await setDoc(userRef, initialState);
      return initialState;
    }

    return normalizeUserState(user, snapshot.data());
  }

  const localState = safeParseJSON(localStorage.getItem(getStorageKey(user.uid)), null);

  if (localState) {
    return normalizeUserState(user, localState);
  }

  const initialState = createInitialUserState(user);
  localStorage.setItem(getStorageKey(user.uid), JSON.stringify(initialState));
  return initialState;
}

export async function saveUserState(user, nextState) {
  if (!user) {
    return;
  }

  const payload = {
    ...nextState,
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured) {
    await setDoc(doc(firestoreDb, "users", user.uid), payload, { merge: true });
    return;
  }

  localStorage.setItem(getStorageKey(user.uid), JSON.stringify(payload));
}
