import { sendEmail } from "@/lib/mailer";

type ReceiptParams = {
  to: string;
  authorName: string;
  requestId: number;
  studyTitle: string;
  amount: string;
  currency: string;
  captureId: string;
};

type RejectionRefundParams = {
  to: string;
  authorName: string;
  studyTitle: string;
  amount: string;
  currency: string;
  refundId: string;
  reviewNotes?: string | null;
};

export async function sendPaymentReceiptEmail(params: ReceiptParams): Promise<void> {
  const subject = `تأكيد دفع رسوم نشر الدراسة — طلب #${params.requestId}`;
  const body = [
    `مرحباً ${params.authorName}،`,
    "",
    "تم استلام دفعتك لرسوم نشر الدراسة بنجاح.",
    "",
    `رقم الطلب: ${params.requestId}`,
    `عنوان الدراسة: ${params.studyTitle}`,
    `المبلغ: ${params.amount} ${params.currency}`,
    `معرّف PayPal: ${params.captureId}`,
    "",
    "سيتم مراجعة طلبك من قبل فريق التحرير.",
    "",
    "مع تحيات،",
    "مدار البيان",
  ].join("\n");

  await sendEmail(params.to, subject, body);
}

export async function sendRejectionRefundEmail(params: RejectionRefundParams): Promise<void> {
  const subject = `رفض طلب النشر واسترداد المبلغ — ${params.studyTitle}`;
  const notes = params.reviewNotes?.trim()
    ? `\nملاحظات المراجعة:\n${params.reviewNotes.trim()}\n`
    : "";

  const body = [
    `مرحباً ${params.authorName}،`,
    "",
    "نأسف لإبلاغك بأن طلب نشر دراستك قد تم رفضه.",
    notes,
    `عنوان الدراسة: ${params.studyTitle}`,
    "",
    "تم إصدار استرداد كامل للمبلغ المدفوع:",
    `المبلغ: ${params.amount} ${params.currency}`,
    `معرّف الاسترداد: ${params.refundId}`,
    "",
    "قد يستغرق ظهور المبلغ في حسابك بضعة أيام عمل حسب مزود الدفع.",
    "",
    "مع تحيات،",
    "مدار البيان",
  ].join("\n");

  await sendEmail(params.to, subject, body);
}
