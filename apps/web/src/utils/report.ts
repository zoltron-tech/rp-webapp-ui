import { SUPPORT_USERNAME } from "@nw/chat";

/**
 * The toast after any report goes through (APP_STORE_REVIEW_PLAN.md H2).
 * Reports are read by hand by the support team, and any follow-up comes as a
 * private message from the verified support account; the reporter is told
 * both, instead of a bare "Reported successfully". Same words as the mobile
 * app's `src/lib/report.ts`.
 */
export const REPORT_SENT_TOAST = `Report sent. Our support team reads every report and may follow up in your inbox from the verified @${SUPPORT_USERNAME} account.`;
