import { Navigate } from "react-router-dom";
import { AuthModal } from "../components/auth/AuthModal";
import { useAuth } from "../hooks/useAuth";

export function SignupPage() {
  const { isAuthenticated, loading } = useAuth();

  if (!loading && isAuthenticated) {
    return <Navigate replace to="/app/dashboard" />;
  }

  return (
    <div className="relative min-h-screen bg-slate-950">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#100D28_0%,#1A1446_48%,#1A1446_100%)]" />
      <AuthModal initialMode="signup" isOpen />
    </div>
  );
}
