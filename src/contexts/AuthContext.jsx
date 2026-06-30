import { createContext, useEffect, useMemo, useState } from "react";
import {
  authMode,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  subscribeToAuthChanges
} from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      authMode,
      login: signInWithEmail,
      signup: signUpWithEmail,
      logout: signOutUser
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
