"use client";

import { useCallback, useEffect, useState } from "react";

import type { ActivityFeedItem } from "@/lib/activity-i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function useAccountActivityFeed(userId: string | null, limit = 10) {
  const [items, setItems] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));

  const refresh = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("activity_events")
      .select("id, message, created_at, type, artwork_id, metadata")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      setItems([]);
    } else {
      setItems((data as ActivityFeedItem[]) ?? []);
    }
    setLoading(false);
  }, [limit, userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, loading, refresh };
}
