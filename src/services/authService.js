import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { firebaseAuth, isFirebaseConfigured } from "../lib/firebase";
import { safeParseJSON } from "../utils/helpers";

const DEMO_USERS_KEY = "cryptocraze_demo_users";
const DEMO_SESSION_KEY = "cryptocraze_demo_session";
const demoListeners = new Set();

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.name || "CryptoCraze User"
  };
}

function getDemoUsers() {
  return safeParseJSON(localStorage.getItem(DEMO_USERS_KEY), []);
}

function saveDemoUsers(users) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

function getDemoSession() {
  return safeParseJSON(localStorage.getItem(DEMO_SESSION_KEY), null);
}

function setDemoSession(user) {
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
  demoListeners.forEach((listener) => listener(user));
}

export const authMode = isFirebaseConfigured ? "firebase" : "demo";

export async function signUpWithEmail({ name, email, password }) {
  if (isFirebaseConfigured) {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    await updateProfile(credential.user, { displayName: name });
    return normalizeUser({ ...credential.user, displayName: name });
  }

  const users = getDemoUsers();
  if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }

  const nextUser = {
    uid: crypto.randomUUID(),
    email,
    password,
    name
  };

  saveDemoUsers([...users, nextUser]);
  setDemoSession(normalizeUser({ ...nextUser, displayName: name }));
  return normalizeUser({ ...nextUser, displayName: name });
}

export async function signInWithEmail({ email, password }) {
  if (isFirebaseConfigured) {
    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return normalizeUser(credential.user);
  }

  const users = getDemoUsers();
  const user = users.find(
    (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const normalized = normalizeUser({ ...user, displayName: user.name });
  setDemoSession(normalized);
  return normalized;
}

export async function signOutUser() {
  if (isFirebaseConfigured) {
    await signOut(firebaseAuth);
    return;
  }

  localStorage.removeItem(DEMO_SESSION_KEY);
  demoListeners.forEach((listener) => listener(null));
}

export function subscribeToAuthChanges(callback) {
  if (isFirebaseConfigured) {
    return onAuthStateChanged(firebaseAuth, (user) => {
      callback(normalizeUser(user));
    });
  }

  demoListeners.add(callback);
  callback(getDemoSession());

  return () => {
    demoListeners.delete(callback);
  };
}
