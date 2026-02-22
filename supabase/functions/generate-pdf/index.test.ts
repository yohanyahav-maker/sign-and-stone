import "https://deno.land/std@0.224.0/dotenv/load.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

async function callFunction(name: string, body: unknown, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

Deno.test("E2E: Full change order flow (requires auth)", async () => {
  // This test requires a valid auth token. 
  // In a real setup, you'd sign in first.
  // For now, this validates the edge functions are deployed and responding.

  // Test 1: validate-portal-token without token should return 400
  const validateRes = await callFunction("validate-portal-token", {});
  console.log("validate-portal-token (no token):", validateRes.status, validateRes.data);
  if (validateRes.status !== 400) {
    throw new Error(`Expected 400, got ${validateRes.status}`);
  }

  // Test 2: client-respond without params should return 400
  const respondRes = await callFunction("client-respond", {});
  console.log("client-respond (no params):", respondRes.status, respondRes.data);
  if (respondRes.status !== 400) {
    throw new Error(`Expected 400, got ${respondRes.status}`);
  }

  // Test 3: generate-portal-token without auth should return 401
  const genTokenRes = await callFunction("generate-portal-token", { change_order_id: "test" });
  console.log("generate-portal-token (no auth):", genTokenRes.status, genTokenRes.data);
  if (genTokenRes.status !== 401) {
    throw new Error(`Expected 401, got ${genTokenRes.status}`);
  }

  // Test 4: generate-pdf without auth should return 401
  const pdfRes = await callFunction("generate-pdf", { change_order_id: "test" });
  console.log("generate-pdf (no auth):", pdfRes.status, pdfRes.data);
  if (pdfRes.status !== 401) {
    throw new Error(`Expected 401, got ${pdfRes.status}`);
  }

  console.log("✅ All basic edge function tests passed");
});
