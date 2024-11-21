import axios, { AxiosInstance } from 'axios';
import pino from 'pino';
import pretty from 'pino-pretty';
import { env } from '../env';
import {
  CommonWebhookPayload,
  ErrorWebhooksPayload,
  ProgressWebhooksPayload,
  SuccessWebhooksPayload,
} from '../interfaces';

export class WebhooksService {
  private readonly axios: AxiosInstance;
  private readonly logger = pino(pretty()).child({
    service: WebhooksService.name,
  });

  constructor() {
    this.axios = axios.create({
      headers: {
        Authorization: `Bearer ${env.BEARER_AUTH_TOKEN}`,
      },
    });
  }

  success(webhookUrl: string, data: SuccessWebhooksPayload) {
    this.logger.info(`Job completed[${data.chatId}]: ${data.resultVideoUrl}`);
    return this.send(webhookUrl, data);
  }

  error(webhookUrl: string, data: ErrorWebhooksPayload) {
    this.logger.info(`Job failed[${data.chatId}]: ${data.error}`);
    return this.send(webhookUrl, data);
  }

  progress(webhookUrl: string, data: ProgressWebhooksPayload) {
    this.logger.info(`Job progress[${data.chatId}]: ${data.progress}`);
    return this.send(webhookUrl, data);
  }

  private send<T extends CommonWebhookPayload>(webhookUrl: string, data: T) {
    return this.axios.post(webhookUrl, data).catch((err) => {
      this.logger.warn(`Webhook ${webhookUrl} request error: ${err}`);
    });
  }
}
