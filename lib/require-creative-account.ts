import type { SupabaseClient, User } from "@supabase/supabase-js";

export type CreativeAccountContext = {
  user: User;
  actor: {
    user_id: string;
    role: "artist";
    display_name: string | null;
  };
};

export async function requireCreativeAccount(
  supabase: SupabaseClient
): Promise<
  | { ok: true; creative: CreativeAccountContext }
  | { ok: false; status: 401 | 403; error: string }
> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const { data: actor } = await supabase
    .from("actor_profiles")
    .select("user_id, role, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!actor || actor.role !== "artist") {
    return { ok: false, status: 403, error: "Creative account required." };
  }

  return {
    ok: true,
    creative: {
      user,
      actor: {
        user_id: actor.user_id,
        role: "artist",
        display_name:
          typeof actor.display_name === "string" ? actor.display_name : null,
      },
    },
  };
}
