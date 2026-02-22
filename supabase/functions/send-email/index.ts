import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailRequest {
  type: "change_sent" | "change_approved" | "change_rejected" | "trial_ending";
  change_order_id?: string;
  user_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, change_order_id, user_id } = (await req.json()) as EmailRequest;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    let to = "";
    let subject = "";
    let html = "";

    if (type === "change_sent" && change_order_id) {
      // Notify client that a change was sent
      const { data: co } = await adminClient
        .from("change_orders")
        .select("*, projects(*)")
        .eq("id", change_order_id)
        .single();

      if (!co) {
        return new Response(JSON.stringify({ error: "Change order not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const project = (co as any).projects;
      to = project?.client_email || "";
      if (!to) {
        return new Response(JSON.stringify({ error: "No client email" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      subject = `שינוי חוזה חדש - ${co.title}`;
      html = `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>שינוי חוזה חדש ממתין לאישורך</h2>
          <p>שלום ${project?.client_name || ""},</p>
          <p>התקבל שינוי חוזה חדש בפרויקט <strong>${project?.name || ""}</strong>.</p>
          <div style="background: #F7F7F5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>${co.title}</strong></p>
            ${co.description ? `<p>${co.description}</p>` : ""}
            <p style="font-size: 24px; font-weight: bold;">₪${(co.price_amount || 0).toLocaleString()}</p>
          </div>
          <p>קישור לאישור נשלח אליך בוואטסאפ.</p>
          <p style="color: #6E6E73; font-size: 12px;">מופעל ע"י שינוי חתום</p>
        </div>
      `;
    } else if ((type === "change_approved" || type === "change_rejected") && change_order_id) {
      // Notify contractor
      const { data: co } = await adminClient
        .from("change_orders")
        .select("*")
        .eq("id", change_order_id)
        .single();

      if (!co) {
        return new Response(JSON.stringify({ error: "Change order not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get contractor email from auth
      const { data: userData } = await adminClient.auth.admin.getUserById(co.user_id);
      to = userData?.user?.email || "";
      if (!to) {
        return new Response(JSON.stringify({ error: "No contractor email" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const isApproved = type === "change_approved";
      subject = isApproved
        ? `✓ שינוי אושר - ${co.title}`
        : `✗ שינוי נדחה - ${co.title}`;

      const { data: approval } = await adminClient
        .from("approvals")
        .select("*")
        .eq("change_order_id", change_order_id)
        .order("signed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      html = `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${isApproved ? "שינוי חוזה אושר ✓" : "שינוי חוזה נדחה ✗"}</h2>
          <div style="background: ${isApproved ? "#f0fdf4" : "#fef2f2"}; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>${co.title}</strong></p>
            <p>סכום: ₪${(co.price_amount || 0).toLocaleString()}</p>
            ${approval ? `<p>חותם: ${approval.client_name}</p>` : ""}
            ${!isApproved && approval?.rejection_reason ? `<p>סיבת דחייה: ${approval.rejection_reason}</p>` : ""}
          </div>
          <p style="color: #6E6E73; font-size: 12px;">מופעל ע"י שינוי חתום</p>
        </div>
      `;
    } else if (type === "trial_ending" && user_id) {
      const { data: userData } = await adminClient.auth.admin.getUserById(user_id);
      to = userData?.user?.email || "";
      if (!to) {
        return new Response(JSON.stringify({ error: "No email" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      subject = "תקופת הניסיון שלך עומדת להסתיים";
      html = `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>תקופת הניסיון עומדת להסתיים</h2>
          <p>שלום,</p>
          <p>תקופת הניסיון שלך בשינוי חתום עומדת להסתיים בעוד 3 ימים.</p>
          <p>שדרג עכשיו כדי להמשיך ליהנות מכל התכונות.</p>
          <p style="color: #6E6E73; font-size: 12px;">מופעל ע"י שינוי חתום</p>
        </div>
      `;
    } else {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "שינוי חתום <noreply@shinui-chatum.co.il>",
        to: [to],
        subject,
        html,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend error:", emailResult);
      return new Response(JSON.stringify({ error: "Email send failed", details: emailResult }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, email_id: emailResult.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Email function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
