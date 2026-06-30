import { apiRequest } from "./apiClient";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

export function loadRazorpayCheckout() {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function createPaymentOrder(payload) {
  return apiRequest("/payments/create-order", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function verifyPayment(payload) {
  return apiRequest("/payments/verify", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function recordPaymentFailure(payload) {
  return apiRequest("/payments/failure", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
