import type { MessageKey } from "@/lib/locale-messages";

type Translate = (key: MessageKey) => string;

export type ReadinessReasonCode =
  | "registry_id_missing"
  | "no_artist_linked"
  | "no_ownership"
  | "title_missing"
  | "metadata_fingerprint_missing"
  | "missing_declared_value"
  | "missing_image"
  | "incomplete_metadata";

export type IntegrityReasonCode =
  | "no_artist_linked"
  | "no_ownership_history"
  | "ownership_ledger_mismatch"
  | "missing_declared_value"
  | "missing_title"
  | "missing_metadata_fingerprint"
  | "missing_image"
  | "certificate_revoked"
  | "missing_verification"
  | "no_certificate_on_file";

export type PriorityReasonCode =
  | IntegrityReasonCode
  | "listed_without_verification"
  | "listed_without_certificate"
  | "no_declared_value"
  | "high_declared_value"
  | "material_declared_value"
  | "verified_without_certificate"
  | "no_verification_signals"
  | "certified_record"
  | "recent_activity"
  | "old_incomplete"
  | "high_value_no_certificate";

export type OpsActionLabelKey =
  | "gallery.ops.action.assignArtist"
  | "gallery.ops.action.viewRecord"
  | "gallery.ops.action.completeDetails"
  | "gallery.ops.action.addValue"
  | "gallery.ops.action.verifyRecord"
  | "gallery.ops.action.issueCertificate";

export type RecommendedActionKey =
  | "gallery.ops.recommended.noAction"
  | "gallery.ops.recommended.reviewRecord";

const READINESS_REASON_KEYS: Record<ReadinessReasonCode, MessageKey> = {
  registry_id_missing: "gallery.ops.reason.registryIdMissing",
  no_artist_linked: "gallery.ops.reason.noArtistLinked",
  no_ownership: "gallery.ops.reason.noOwnership",
  title_missing: "gallery.ops.reason.titleMissing",
  metadata_fingerprint_missing: "gallery.ops.reason.metadataFingerprintMissing",
  missing_declared_value: "gallery.ops.reason.missingDeclaredValue",
  missing_image: "gallery.ops.reason.missingImage",
  incomplete_metadata: "gallery.ops.reason.incompleteMetadata",
};

const INTEGRITY_REASON_KEYS: Record<IntegrityReasonCode, MessageKey> = {
  no_artist_linked: "gallery.ops.reason.noArtistLinked",
  no_ownership_history: "gallery.ops.reason.noOwnershipHistory",
  ownership_ledger_mismatch: "gallery.ops.reason.ownershipLedgerMismatch",
  missing_declared_value: "gallery.ops.reason.missingDeclaredValue",
  missing_title: "gallery.ops.reason.titleMissing",
  missing_metadata_fingerprint: "gallery.ops.reason.metadataFingerprintMissing",
  missing_image: "gallery.ops.reason.missingImage",
  certificate_revoked: "gallery.ops.reason.certificateRevoked",
  missing_verification: "gallery.ops.reason.missingVerification",
  no_certificate_on_file: "gallery.ops.reason.noCertificateOnFile",
};

const PRIORITY_REASON_KEYS: Record<PriorityReasonCode, MessageKey> = {
  ...INTEGRITY_REASON_KEYS,
  listed_without_verification: "gallery.ops.reason.listedWithoutVerification",
  listed_without_certificate: "gallery.ops.reason.listedWithoutCertificate",
  no_declared_value: "gallery.ops.reason.noDeclaredValueOnFile",
  high_declared_value: "gallery.ops.reason.highDeclaredValue",
  material_declared_value: "gallery.ops.reason.materialDeclaredValue",
  verified_without_certificate: "gallery.ops.reason.verifiedWithoutCertificate",
  no_verification_signals: "gallery.ops.reason.noVerificationSignals",
  certified_record: "gallery.ops.reason.certifiedRecord",
  recent_activity: "gallery.ops.reason.recentActivity",
  old_incomplete: "gallery.ops.reason.oldIncomplete",
  high_value_no_certificate: "gallery.ops.reason.highValueNoCertificate",
};

export function translateReadinessReason(
  code: ReadinessReasonCode,
  t: Translate
): string {
  return t(READINESS_REASON_KEYS[code]);
}

export function translateIntegrityReason(
  code: IntegrityReasonCode,
  t: Translate
): string {
  return t(INTEGRITY_REASON_KEYS[code]);
}

export function translatePriorityReason(
  code: PriorityReasonCode,
  t: Translate
): string {
  return t(PRIORITY_REASON_KEYS[code]);
}

export function translateOpsActionLabel(key: OpsActionLabelKey, t: Translate): string {
  return t(key);
}

export function translateRecommendedAction(
  key: RecommendedActionKey,
  t: Translate
): string {
  return t(key);
}
