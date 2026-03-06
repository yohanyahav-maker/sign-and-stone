import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const categoryLabels: Record<string, string> = {
  structural: "שלד",
  electrical: "חשמל",
  plumbing: "אינסטלציה",
  finishing: "גמרים",
  hvac: "מיזוג",
  flooring: "ריצוף",
  painting: "צביעה",
  landscaping: "גינון",
  safety: "בטיחות",
  aluminum: "אלומיניום",
  kitchen: "מטבח",
  insulation: "בידוד",
  concrete: "בטון",
  other: "אחר",
};

function formatCurrency(amount: number): string {
  return `₪${amount.toLocaleString("he-IL", { minimumFractionDigits: 0 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generateHtml(data: {
  co: any;
  project: any;
  profile: any;
  approval: any;
}): string {
  const { co, project, profile, approval } = data;
  const priceAmount = co.price_amount || 0;
  const vatAmount = co.include_vat ? priceAmount * (co.vat_rate / 100) : 0;
  const totalAmount = priceAmount + vatAmount;
  const contractorName = profile?.company_name || profile?.full_name || "";

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="utf-8"/>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #111; direction: rtl; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 30px; }
  .logo { max-height: 60px; }
  h1 { font-size: 24px; margin: 0; }
  .subtitle { color: #6E6E73; font-size: 14px; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 16px; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  .row { display: flex; justify-content: space-between; padding: 6px 0; }
  .label { color: #6E6E73; }
  .value { font-weight: 500; }
  .price-block { background: #F7F7F5; padding: 20px; border-radius: 8px; margin: 20px 0; }
  .total { font-size: 28px; font-weight: bold; }
  .approval-block { background: #f0fdf4; border: 1px solid #22c55e; padding: 16px; border-radius: 8px; margin: 20px 0; }
  .rejection-block { background: #fef2f2; border: 1px solid #ef4444; padding: 16px; border-radius: 8px; margin: 20px 0; }
  .footer { margin-top: 40px; border-top: 1px solid #eee; padding-top: 16px; text-align: center; color: #6E6E73; font-size: 12px; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>שינוי חוזה</h1>
      <div class="subtitle">${escapeHtml(contractorName)}</div>
    </div>
    ${profile?.logo_url ? `<img class="logo" src="${escapeHtml(profile.logo_url)}" alt="logo"/>` : ""}
  </div>

  <div class="section">
    <div class="section-title">פרטי פרויקט</div>
    <div class="row"><span class="label">שם פרויקט</span><span class="value">${escapeHtml(project?.name || "")}</span></div>
    <div class="row"><span class="label">לקוח</span><span class="value">${escapeHtml(project?.client_name || "")}</span></div>
    ${project?.address ? `<div class="row"><span class="label">כתובת</span><span class="value">${escapeHtml(project.address)}</span></div>` : ""}
  </div>

  <div class="section">
    <div class="section-title">פרטי השינוי</div>
    <div class="row"><span class="label">כותרת</span><span class="value">${escapeHtml(co.title)}</span></div>
    <div class="row"><span class="label">קטגוריה</span><span class="value">${categoryLabels[co.category] || co.category}</span></div>
    ${co.description ? `<div class="row"><span class="label">תיאור</span><span class="value">${escapeHtml(co.description)}</span></div>` : ""}
    ${co.impact_days ? `<div class="row"><span class="label">השפעה על לוח זמנים</span><span class="value">${co.impact_days} ימים</span></div>` : ""}
  </div>

  <div class="price-block">
    <div class="section-title">תמחור</div>
    <div class="row"><span class="label">סכום</span><span class="value">${formatCurrency(priceAmount)}</span></div>
    ${co.include_vat ? `<div class="row"><span class="label">מע"מ (${co.vat_rate}%)</span><span class="value">${formatCurrency(vatAmount)}</span></div>` : ""}
    <div class="row"><span class="label">סה"כ</span><span class="total">${formatCurrency(totalAmount)}</span></div>
  </div>

  ${approval ? (approval.decision === "approved" ? `
  <div class="approval-block">
    <div class="section-title">אישור לקוח</div>
    <div class="row"><span class="label">שם החותם</span><span class="value">${escapeHtml(approval.client_name)}</span></div>
    <div class="row"><span class="label">תאריך</span><span class="value">${formatDate(approval.signed_at)}</span></div>
    <div class="row"><span class="label">החלטה</span><span class="value" style="color: #22c55e;">מאושר ✓</span></div>
  </div>` : `
  <div class="rejection-block">
    <div class="section-title">דחיית לקוח</div>
    <div class="row"><span class="label">שם</span><span class="value">${escapeHtml(approval.client_name)}</span></div>
    <div class="row"><span class="label">תאריך</span><span class="value">${formatDate(approval.signed_at)}</span></div>
    <div class="row"><span class="label">החלטה</span><span class="value" style="color: #ef4444;">נדחה ✗</span></div>
    ${approval.rejection_reason ? `<div class="row"><span class="label">סיבה</span><span class="value">${escapeHtml(approval.rejection_reason)}</span></div>` : ""}
  </div>`) : ""}

  <div class="footer">
    <p>מסמך זה הופק אוטומטית ע"י שינוי חתום • ${formatDate(new Date().toISOString())}</p>
  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Support two auth modes: user auth OR service-role internal call
    const isServiceCall = req.headers.get("x-service-role") === "true";
    const authHeader = req.headers.get("Authorization");

    let userId: string;

    if (isServiceCall && authHeader === `Bearer ${supabaseServiceKey}`) {
      // Internal service call — we'll determine userId from the change order
      userId = "__service__";
    } else if (authHeader) {
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
      userId = user.id;
    } else {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { change_order_id } = await req.json();
    if (!change_order_id) {
      return new Response(JSON.stringify({ error: "change_order_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get change order
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

    // For user calls, verify ownership. For service calls, use the CO's user_id.
    if (userId === "__service__") {
      userId = co.user_id;
    } else if (co.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get project
    const { data: project } = await adminClient
      .from("projects")
      .select("*")
      .eq("id", co.project_id)
      .single();

    // Get profile
    const { data: profile } = await adminClient
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Get approval if exists
    const { data: approval } = await adminClient
      .from("approvals")
      .select("*")
      .eq("change_order_id", change_order_id)
      .order("signed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Generate HTML
    const html = generateHtml({ co, project, profile, approval });

    const fileName = `change-order-${change_order_id}-${Date.now()}.html`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await adminClient.storage
      .from("pdfs")
      .upload(filePath, new Blob([html], { type: "text/html" }), {
        contentType: "text/html",
        upsert: true,
      });

    if (uploadError) {
      return new Response(JSON.stringify({ error: "Upload failed: " + uploadError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get signed URL (24h)
    const { data: signedUrlData, error: signedUrlError } = await adminClient.storage
      .from("pdfs")
      .createSignedUrl(filePath, 24 * 60 * 60);

    if (signedUrlError) {
      return new Response(JSON.stringify({ error: "Signed URL failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Audit log
    await adminClient.from("audit_log").insert({
      table_name: "change_orders",
      record_id: change_order_id,
      action: "EXPORT_PDF",
      new_value: { file_path: filePath },
      performed_by: userId,
    });

    return new Response(
      JSON.stringify({ url: signedUrlData.signedUrl, file_path: filePath }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
