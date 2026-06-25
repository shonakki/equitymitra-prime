/**
 * Razorpay checkout integration.
 * Loads checkout.js lazily, creates order via backend, opens modal.
 * On success: verifies signature server-side, activates plan.
 */

import { api, ApiError } from "./api";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; contact?: string; email?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
  handler: (response: RazorpayResponse) => void;
}

interface RazorpayInstance {
  open(): void;
  on(event: string, handler: () => void): void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

let scriptLoaded = false;

function loadRazorpayScript(): Promise<void> {
  if (scriptLoaded && window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script    = document.createElement("script");
    script.src      = "https://checkout.razorpay.com/v1/checkout.js";
    script.async    = true;
    script.onload   = () => { scriptLoaded = true; resolve(); };
    script.onerror  = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

export interface PaymentResult {
  success: boolean;
  plan?: string;
  token?: string;
  error?: string;
}

export async function initiatePayment(
  planId: string,
  user: { name: string; phone?: string | null; email?: string | null },
  onUpdate: (result: PaymentResult) => void,
): Promise<void> {
  try {
    // 1. Create order on backend
    const order = await api.post<{
      ok: boolean;
      orderId: string;
      keyId: string;
      amount: number;
      currency: string;
      planLabel: string;
    }>("/api/payment/create-order", { planId });

    // 2. Load Razorpay script
    await loadRazorpayScript();

    // 3. Open checkout modal
    const rzp = new window.Razorpay({
      key:         order.keyId,
      amount:      order.amount,
      currency:    order.currency,
      name:        "EquityMitra",
      description: order.planLabel,
      order_id:    order.orderId,
      prefill: {
        name:    user.name,
        contact: user.phone ? `+91${user.phone}` : undefined,
        email:   user.email || undefined,
      },
      theme: { color: "#d4af37" },
      modal: {
        ondismiss: () => {
          onUpdate({ success: false, error: "Payment cancelled" });
        },
      },
      handler: async (response: RazorpayResponse) => {
        try {
          // 4. Verify signature on backend — NEVER trust frontend payment_id alone
          const verified = await api.post<{
            ok: boolean;
            token: string;
            plan: string;
          }>("/api/payment/verify", {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          });

          onUpdate({ success: true, plan: verified.plan, token: verified.token });
        } catch (err) {
          onUpdate({
            success: false,
            error:   err instanceof ApiError ? err.message : "Payment verification failed",
          });
        }
      },
    });

    rzp.open();
  } catch (err) {
    onUpdate({
      success: false,
      error:   err instanceof ApiError ? err.message : "Failed to initiate payment",
    });
  }
}
