import { Navigate } from "react-router-dom";
import { Loader } from "../shared/Loader";
import { useAuth } from "../../hooks/useAuth";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Loader label="Checking your session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  return children;
}
