import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton para uso em componentes client-side
const supabase = createClient();
export default supabase;

// ---------------------------------------------------------------------------
// Helpers de autenticação
// ---------------------------------------------------------------------------

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session;
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function checkSubscription(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_subscriptions")
    .select("id, expires_at, status")
    .eq("user_id", userId)
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())
    .maybeSingle();
  return data !== null;
}

export async function signOut() {
  await supabase.auth.signOut();
}
