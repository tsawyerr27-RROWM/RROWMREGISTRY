"use client";

import { useSyncExternalStore } from "react";

import {
  getFieldIntelSnapshot,
  subscribeFieldIntel,
  type FieldIntelSnapshot,
} from "@/lib/field-intelligence-events";

export function useFieldIntelligence(): FieldIntelSnapshot {
  return useSyncExternalStore(subscribeFieldIntel, getFieldIntelSnapshot, getFieldIntelSnapshot);
}
