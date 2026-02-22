import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, client_name, action, rejection_reason } = await req.json();

    if (!token || !client_name || !action) {
      return new Response(
        JSON.stringify({ error: "token, client_name, action required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action !== "approved" && action !== "rejected") {
      return new Response(
        JSON.stringify({ error: "action must be 'approved' or 'rejected'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "rejected" && !rejection_reason?.trim()) {
      return new Response(
        JSON.stringify({ error: "rejection_reason required for rejection" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate inputs
    if (client_name.length > 100) {
      return new Response(
        JSON.stringify({ error: "client_name too long" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Hash token and find matching change order
    const tokenHash = await sha256(token);

    const { data: co, error: coError } = await adminClient
      .from("change_orders")
      .select("*")
      .eq("portal_token_hash", tokenHash)
      .single();

    if (coError || !co) {
      return new Response(
        JSON.stringify({ error: "invalid_token", message: "קישור לא תקין" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already used
    if (co.portal_token_used) {
      return new Response(
        JSON.stringify({ error: "already_used", message: "קישור זה כבר טופל", status: co.status }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiry
    if (co.portal_token_expires_at && new Date(co.portal_token_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "expired", message: "קישור פג תוקף" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check status is 'sent'
    if (co.status !== "sent") {
      return new Response(
        JSON.stringify({ error: "invalid_status", message: "לא ניתן לטפל בשינוי זה", status: co.status }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newStatus = action === "approved" ? "approved" : "rejected";

    // Update change order
    const { error: updateError } = await adminClient
      .from("change_orders")
      .update({
        status: newStatus,
        portal_token_used: true,
      })
      .eq("id", co.id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get client IP and user agent
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Create approval record
    await adminClient.from("approvals").insert({
      change_order_id: co.id,
      client_name: client_name.trim().slice(0, 100),
      decision: action,
      rejection_reason: action === "rejected" ? rejection_reason?.trim().slice(0, 1000) : null,
      ip_address: ip,
      user_agent: userAgent.slice(0, 500),
    });

    // Audit log
    await adminClient.from("audit_log").insert({
      table_name: "change_orders",
      record_id: co.id,
      action: "status_change",
      old_value: { status: "sent" },
      new_value: { status: newStatus, client_name: client_name.trim() },
      performed_by: null,
    });

    return new Response(
      JSON.stringify({ success: true, status: newStatus }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
