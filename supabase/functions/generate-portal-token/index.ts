import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateToken(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join("");
}

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
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User client for auth verification
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse body
    const { change_order_id } = await req.json();
    if (!change_order_id) {
      return new Response(JSON.stringify({ error: "change_order_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service client for DB operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get change order and verify ownership
    const { data: co, error: coError } = await adminClient
      .from("change_orders")
      .select("*")
      .eq("id", change_order_id)
      .single();

    if (coError || !co) {
      return new Response(JSON.stringify({ error: "Change order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (co.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Must be in 'priced' or 'sent' status
    if (!["priced", "sent"].includes(co.status)) {
      return new Response(
        JSON.stringify({ error: `Cannot send from status: ${co.status}` }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate token
    const rawToken = generateToken(32);
    const tokenHash = await sha256(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Build update payload
    const updatePayload: Record<string, any> = {
      portal_token_hash: tokenHash,
      portal_token_expires_at: expiresAt,
      portal_token_used: false,
    };

    // Only update status if transitioning from 'priced' to 'sent'
    if (co.status === "priced") {
      updatePayload.status = "sent";
    }

    const { error: updateError } = await adminClient
      .from("change_orders")
      .update(updatePayload)
      .eq("id", change_order_id);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Audit log
    const auditAction = co.status === "sent" ? "REMINDER_SENT" : "status_change";
    await adminClient.from("audit_log").insert({
      table_name: "change_orders",
      record_id: change_order_id,
      action: auditAction,
      old_value: { status: co.status },
      new_value: { status: updatePayload.status || co.status },
      performed_by: user.id,
    });

    return new Response(
      JSON.stringify({ token: rawToken, expires_at: expiresAt }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
