import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Stripe signature verification using Web Crypto API
async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string
): Promise<boolean> {
  const parts = sigHeader.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1];
  const signatures = parts
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.split("=")[1]);

  if (!timestamp || signatures.length === 0) return false;

  // Check timestamp is within 5 minutes
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload)
  );
  const expectedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return signatures.includes(expectedSig);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeWebhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: "Webhook not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.text();
    const sigHeader = req.headers.get("stripe-signature");

    if (!sigHeader) {
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isValid = await verifyStripeSignature(body, sigHeader, stripeWebhookSecret);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = JSON.parse(body);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const customerId = sub.customer;
        const status = sub.status === "active" ? "active" :
                       sub.status === "past_due" ? "past_due" :
                       sub.status === "canceled" ? "canceled" : "active";

        // Determine plan from price
        const priceId = sub.items?.data?.[0]?.price?.id;
        // We'll map plan based on amount or metadata
        const amount = sub.items?.data?.[0]?.price?.unit_amount;
        const plan = amount && amount >= 30000 ? "pro" : "basic";

        const limits = plan === "pro"
          ? { project_limit: 999, monthly_change_limit: 999 }
          : { project_limit: 5, monthly_change_limit: 50 };

        const { error } = await adminClient
          .from("subscriptions")
          .update({
            stripe_subscription_id: sub.id,
            status,
            plan,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            ...limits,
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error("Failed to update subscription:", error);
        }

        // Audit log
        await adminClient.from("audit_log").insert({
          table_name: "subscriptions",
          record_id: sub.id,
          action: `stripe_${event.type}`,
          new_value: { status, plan, stripe_status: sub.status },
          performed_by: null,
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        await adminClient
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_customer_id", customerId);

        await adminClient.from("audit_log").insert({
          table_name: "subscriptions",
          record_id: invoice.subscription || invoice.id,
          action: "stripe_payment_failed",
          new_value: { customer_id: customerId },
          performed_by: null,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = sub.customer;

        await adminClient
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_customer_id", customerId);

        await adminClient.from("audit_log").insert({
          table_name: "subscriptions",
          record_id: sub.id,
          action: "stripe_subscription_deleted",
          new_value: { customer_id: customerId },
          performed_by: null,
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
