import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { BuyPage } from "../pages/BuyPage";
import { CartPage } from "../pages/CartPage";
import { CoinDetailsPage } from "../pages/CoinDetailsPage";
import { DashboardPage } from "../pages/DashboardPage";
import { HomePage } from "../pages/HomePage";
import { LegalPage } from "../pages/LegalPage";
import { LoginPage } from "../pages/LoginPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PortfolioPage } from "../pages/PortfolioPage";
import { SignupPage } from "../pages/SignupPage";
import { WatchlistPage } from "../pages/WatchlistPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/signup",
    element: <SignupPage />
  },
  {
    path: "/privacy-policy",
    element: <LegalPage type="privacy-policy" />
  },
  {
    path: "/terms",
    element: <LegalPage type="terms" />
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate replace to="/app/dashboard" />
      },
      {
        path: "dashboard",
        element: <DashboardPage />
      },
      {
        path: "buy",
        element: <BuyPage />
      },
      {
        path: "cart",
        element: <CartPage />
      },
      {
        path: "portfolio",
        element: <PortfolioPage />
      },
      {
        path: "watchlist",
        element: <WatchlistPage />
      },
      {
        path: "markets/:coinId",
        element: <CoinDetailsPage />
      }
    ]
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
]);
