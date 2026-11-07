import { SUPPORT_USERNAME } from "@nw/chat";
import { Alert } from "react-native";

/**
 * What someone is told after a report goes through, wherever they reported
 * from (APP_STORE_REVIEW_PLAN.md H2).
 *
 * Reports are read by hand by the support team, and the follow-up — a
 * question, or word that something was done — arrives as a private message
 * from the verified support account. Saying so here is the "timely response"
 * half of Guideline 1.2: the reporter knows a person reads it and where the
 * answer will appear, instead of a bare "Reported".
 */
export const REPORT_SENT_TITLE = "Report sent";
export const REPORT_SENT_MESSAGE = `Thanks for telling us. Our support team reads every report and may follow up with you in Inbox from the verified @${SUPPORT_USERNAME} account.`;

export const alertReportSent = () =>
  Alert.alert(REPORT_SENT_TITLE, REPORT_SENT_MESSAGE);
