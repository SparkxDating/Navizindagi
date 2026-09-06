import { createFileRoute } from "@tanstack/react-router";
import { handleRazorpayWebhook } from "@/lib/server/razorpay-webhook";

export const Route = createFileRoute("/api/razorpay/webhook")({
  server: {
    handlers: {
      POST: ({ request }) => handleRazorpayWebhook(request),
    },
  },
});
