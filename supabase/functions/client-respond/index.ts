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
    const { token, client_name, action, rejection_reason, signature_data } = await req.json();

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

    // Upload signature if provided (base64 PNG)
    let signatureUrl: string | null = null;
    if (action === "approved" && signature_data) {
      try {
        // signature_data is a base64 data URL: data:image/png;base64,...
        const base64 = signature_data.replace(/^data:image\/png;base64,/, "");
        const binaryStr = atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const sigPath = `${co.id}/${crypto.randomUUID()}.png`;
        const { error: sigUploadErr } = await adminClient.storage
          .from("signatures")
          .upload(sigPath, bytes, { contentType: "image/png", upsert: false });
        if (!sigUploadErr) {
          signatureUrl = sigPath;
        }
      } catch (sigErr) {
        console.error("Signature upload failed:", sigErr);
      }
    }

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
      signature_url: signatureUrl,
    });

    // Audit log
    const auditAction = action === "approved" ? "change_approved" : "change_rejected";
    await adminClient.from("audit_log").insert({
      table_name: "change_orders",
      record_id: co.id,
      action: auditAction,
      old_value: { status: "sent" },
      new_value: { status: newStatus, client_name: client_name.trim(), project_id: co.project_id },
      performed_by: null,
    });

    // Auto-generate PDF on approval
    if (action === "approved") {
      try {
        const pdfResponse = await fetch(`${supabaseUrl}/functions/v1/generate-pdf`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "x-service-role": "true",
          },
          body: JSON.stringify({ change_order_id: co.id }),
        });
        if (!pdfResponse.ok) {
          console.error("Auto PDF generation failed:", await pdfResponse.text());
        }
      } catch (pdfErr) {
        console.error("Auto PDF generation error:", pdfErr);
      }
    }

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
