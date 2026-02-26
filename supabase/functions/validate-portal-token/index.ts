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
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "token required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const tokenHash = await sha256(token);

    const { data: co, error: coError } = await adminClient
      .from("change_orders")
      .select("id, title, description, category, price_amount, include_vat, vat_rate, impact_days, status, portal_token_used, portal_token_expires_at, project_id")
      .eq("portal_token_hash", tokenHash)
      .single();

    if (coError || !co) {
      return new Response(
        JSON.stringify({ error: "invalid_token", message: "קישור לא תקין" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (co.portal_token_used) {
      return new Response(
        JSON.stringify({ error: "already_used", message: "קישור זה כבר טופל", status: co.status }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (co.portal_token_expires_at && new Date(co.portal_token_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "expired", message: "קישור פג תוקף" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get contractor profile for logo/branding
    const { data: project } = await adminClient
      .from("projects")
      .select("user_id, name")
      .eq("id", co.project_id)
      .single();

    let contractorName = "";
    let logoUrl = "";
    if (project) {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("company_name, full_name, logo_url")
        .eq("user_id", project.user_id)
        .single();
      if (profile) {
        contractorName = profile.company_name || profile.full_name || "";
        logoUrl = profile.logo_url || "";
      }
    }

    // Get attachments with context (BEFORE/AFTER)
    const { data: attachments } = await adminClient
      .from("attachments")
      .select("id, file_name, file_url, file_type, context")
      .eq("change_order_id", co.id);

    // Generate signed URLs for attachments from the 'attachments' bucket
    const enrichedAttachments = [];
    if (attachments) {
      for (const att of attachments) {
        // Extract storage path from the public URL
        // file_url format: .../object/public/attachments/USER_ID/CO_ID/FILE.ext
        const parts = att.file_url.split("/attachments/");
        const storagePath = parts.length > 1 ? parts[parts.length - 1] : null;
        let signedUrl = att.file_url;
        if (storagePath) {
          const { data: signed } = await adminClient.storage
            .from("attachments")
            .createSignedUrl(storagePath, 86400);
          if (signed) signedUrl = signed.signedUrl;
        }
        enrichedAttachments.push({
          id: att.id,
          file_name: att.file_name,
          file_type: att.file_type,
          context: att.context,
          signed_url: signedUrl,
        });
      }
    }

    // Audit: client opened portal
    await adminClient.from("audit_log").insert({
      table_name: "change_orders",
      record_id: co.id,
      action: "CLIENT_OPENED_PORTAL",
      old_value: null,
      new_value: null,
      performed_by: null,
    });

    return new Response(
      JSON.stringify({
        change_order: {
          id: co.id,
          title: co.title,
          description: co.description,
          category: co.category,
          price_amount: co.price_amount,
          include_vat: co.include_vat,
          vat_rate: co.vat_rate,
          impact_days: co.impact_days,
          status: co.status,
        },
        attachments: enrichedAttachments,
        project_name: project?.name || "",
        contractor_name: contractorName,
        contractor_logo: logoUrl,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
