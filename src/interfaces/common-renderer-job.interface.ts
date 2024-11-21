export interface ICommonRendererJob {
  chatId: number;
  language: string;
  messageId: number;
  isPaid: boolean;
  duration: number;

  onErrorCallbackUrl: string;
  onSuccessCallbackUrl: string;
  onProgressCallbackUrl: string;

  [propName: string]: any;
}
