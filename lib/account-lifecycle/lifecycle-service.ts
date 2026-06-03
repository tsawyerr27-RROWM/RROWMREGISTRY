import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";
import {
  DELETION_GRACE_MS,
  type AccountStatus,
} from "@/lib/account-lifecycle/constants";

export type ActorLifecycleRow = {
  user_id: string;
  role: string;
  display_name: string | null;
  account_status: AccountStatus;
  deactivated_at: string | null;
  deleted_at: string | null;
  deletion_scheduled_at: string | null;
  deletion_reason: string | null;
  deletion_notification_email: string | null;
};

export async function getActorLifecycle(
  service: SupabaseClient,
  userId: string
): Promise<ActorLifecycleRow | null> {
  const { data } = await service
    .from("actor_profiles")
    .select(
      "user_id, role, display_name, account_status, deactivated_at, deleted_at, deletion_scheduled_at, deletion_reason, deletion_notification_email"
    )
    .eq("user_id", userId)
    .maybeSingle();
  return data as ActorLifecycleRow | null;
}

export function generateRecoveryToken(): string {
  return randomBytes(32).toString("hex");
}

export async function scheduleAccountDeletion(params: {
  userId: string;
  actorUserId: string;
  email: string;
  reason?: string | null;
}): Promise<{ scheduledAt: string; recoveryToken: string }> {
  const service = createSupabaseServiceClient();
  const scheduledAt = new Date(Date.now() + DELETION_GRACE_MS).toISOString();
  const recoveryToken = generateRecoveryToken();
  const recoveryExpires = scheduledAt;

  await service.rpc("anonymise_user_for_deletion", { p_user_id: params.userId });

  await service
    .from("actor_profiles")
    .update({
      account_status: "pending_deletion",
      deletion_scheduled_at: scheduledAt,
      deletion_reason: params.reason?.trim() || null,
      deletion_requested_by: params.actorUserId,
      deletion_notification_email: params.email,
      recovery_token: recoveryToken,
      recovery_token_expires_at: recoveryExpires,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", params.userId);

  return { scheduledAt, recoveryToken };
}

export async function cancelAccountDeletion(userId: string): Promise<void> {
  const service = createSupabaseServiceClient();
  await service
    .from("actor_profiles")
    .update({
      account_status: "active",
      deletion_scheduled_at: null,
      deletion_reason: null,
      deletion_requested_by: null,
      recovery_token: null,
      recovery_token_expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}

export async function deactivateAccount(userId: string): Promise<void> {
  const service = createSupabaseServiceClient();
  const hidden = {
    profile: false,
    ownership: false,
    values: false,
    location: false,
  };

  const { data: actor } = await service
    .from("actor_profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  await service
    .from("actor_profiles")
    .update({
      account_status: "deactivated",
      deactivated_at: new Date().toISOString(),
      public_presence: hidden,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  const role = actor?.role;
  if (role === "artist") {
    await service
      .from("artists")
      .update({ public_presence: hidden })
      .eq("id", userId);
  } else if (role === "collector") {
    await service
      .from("collector_profiles")
      .update({ public_presence: hidden })
      .eq("user_id", userId);
  } else if (role === "gallery") {
    const { data: mem } = await service
      .from("gallery_users")
      .select("gallery_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    if (mem?.gallery_id) {
      await service
        .from("galleries")
        .update({ public_presence: hidden })
        .eq("id", mem.gallery_id);
    }
  }
}

export async function reactivateAccount(userId: string): Promise<void> {
  const service = createSupabaseServiceClient();
  const visible = {
    profile: true,
    ownership: true,
    values: true,
    location: true,
  };

  const { data: actor } = await service
    .from("actor_profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  await service
    .from("actor_profiles")
    .update({
      account_status: "active",
      deactivated_at: null,
      public_presence: visible,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  const role = actor?.role;
  if (role === "artist") {
    await service.from("artists").update({ public_presence: visible }).eq("id", userId);
  } else if (role === "collector") {
    await service
      .from("collector_profiles")
      .update({ public_presence: visible })
      .eq("user_id", userId);
  } else if (role === "gallery") {
    const { data: mem } = await service
      .from("gallery_users")
      .select("gallery_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    if (mem?.gallery_id) {
      await service
        .from("galleries")
        .update({ public_presence: visible })
        .eq("id", mem.gallery_id);
    }
  }
}

export async function finaliseAccountDeletion(userId: string): Promise<void> {
  const service = createSupabaseServiceClient();
  await service.rpc("finalise_account_deletion", { p_user_id: userId });
}

export async function listExpiredPendingDeletions(): Promise<
  Array<{ user_id: string; deletion_notification_email: string | null }>
> {
  const service = createSupabaseServiceClient();
  const { data } = await service
    .from("actor_profiles")
    .select("user_id, deletion_notification_email")
    .eq("account_status", "pending_deletion")
    .lte("deletion_scheduled_at", new Date().toISOString());
  return (data ?? []) as Array<{
    user_id: string;
    deletion_notification_email: string | null;
  }>;
}

export async function restoreAccountByToken(token: string): Promise<string | null> {
  const service = createSupabaseServiceClient();
  const { data } = await service
    .from("actor_profiles")
    .select("user_id, recovery_token_expires_at, account_status")
    .eq("recovery_token", token)
    .maybeSingle();

  if (!data?.user_id || data.account_status !== "pending_deletion") return null;
  if (
    data.recovery_token_expires_at &&
    new Date(data.recovery_token_expires_at).getTime() < Date.now()
  ) {
    return null;
  }

  await cancelAccountDeletion(data.user_id);
  return data.user_id;
}
