import { AuthProvider } from "../contexts/AuthContext";
import { AppDataProvider } from "../contexts/AppDataContext";

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <AppDataProvider>{children}</AppDataProvider>
    </AuthProvider>
  );
}
