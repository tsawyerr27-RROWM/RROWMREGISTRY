/**
 * Single verified Resend sender domain: email.rrowm.io
 * Use RESEND_FROM_INVITATIONS / RESEND_FROM_REGISTRY only to vary the mailbox
 * (same domain), never to introduce another sender domain.
 */
export const EMAIL_FROM = "RROWM Registry <no-reply@email.rrowm.io>";

/** Resend succeeded for DB but email delivery failed — resend / reissue flows */
export const INVITE_EMAIL_UPDATED_MAIL_FAILED_MESSAGE =
  "Invite link refreshed on file. Email did not send; copy the link from the row if needed.";

/** New invitation row persisted but email delivery failed */
export const INVITE_EMAIL_CREATED_MAIL_FAILED_MESSAGE =
  "Invite on file. Email did not send; copy the link from the row if needed.";
