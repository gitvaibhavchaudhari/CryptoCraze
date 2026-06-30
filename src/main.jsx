import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { router } from "./app/router";
import { AppProviders } from "./app/providers";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1A1446",
            color: "#F7F7F8",
            border: "1px solid rgba(136,34,210,0.3)"
          }
        }}
      />
    </AppProviders>
  </React.StrictMode>
);
