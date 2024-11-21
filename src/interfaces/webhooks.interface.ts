export type CommonWebhookPayload = {
  chatId: number;
  language: string;
  messageId: number;
};

export type ProgressWebhooksPayload = CommonWebhookPayload & {
  progress: number;
};
export type SuccessWebhooksPayload = CommonWebhookPayload & {
  isPaid?: boolean;
  duration: number;
  resultVideoUrl: string;
};
export type ErrorWebhooksPayload = CommonWebhookPayload & {
  error: string;
  stacktrace?: string[];
};
