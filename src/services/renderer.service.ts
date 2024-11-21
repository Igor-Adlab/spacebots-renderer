import { randomUUID } from 'crypto';

import { createReadStream } from 'fs';
import { RenderSettings, renderVideo } from '@revideo/renderer';
import { unlink } from 'fs/promises';
import { WebhooksService } from './webhooks.service';
import _ from 'lodash';
import { env } from '../env';
import pino from 'pino';
import pretty from 'pino-pretty';
import { resolve } from 'path';
import { GcpStorageService } from './gcp-storage.service';
import {
  CommonWebhookPayload,
  ICommonRendererJob,
  ITokTokVideosJob,
  IVideoCaptionJob,
} from '../interfaces';

const RESULTS_BUCKET = 'renderer';
const REMOVE_DELAY = 120 * 60 * 1000;

export interface ICommonJobOptions {
  upload?: boolean;
  outDir?: string;
}

type RendererProjectSettings = Pick<
  RenderSettings,
  'outDir' | 'outFile' | 'progressCallback' | 'workers' | 'logProgress'
>;

const TEMPLATE_PATHS = {
  SPLIT: resolve(__dirname, env.TEMPLATE_SPLIT),
  POPUP: resolve(__dirname, env.TEMPLATE_POPUP),

  CAPTIONS: resolve(__dirname, env.TEMPLATE_CAPTIONS),
};

export class RendererService {
  private readonly webhooks: WebhooksService;
  private readonly storage: GcpStorageService;
  private readonly logger = pino(pretty()).child({
    service: RendererService.name,
  });

  constructor({ storage }) {
    this.storage = storage;
    this.webhooks = new WebhooksService();
  }

  async processVideoCaptionsBotMessage(
    job: IVideoCaptionJob,
    options: ICommonJobOptions = {}
  ) {
    const {
      chatId,
      language,
      template,
      isPaid,
      duration,
      messageId,
      onSuccessCallbackUrl,
      onErrorCallbackUrl,
    } = job;

    const payload: CommonWebhookPayload = {
      chatId,
      language,
      messageId,
    };

    try {
      let file, err;
      try {
        file = await this.render(TEMPLATE_PATHS.CAPTIONS, job, options.outDir);
      } catch (err) {
        this.logger.error('Rendering error: ', err);
        throw err;
      }

      if (!file) {
        this.logger.error('Rendered without file: ', file);
        throw new Error('File not created!');
      }

      // Upload to vercel storage
      if (!options.outDir) {
        const url = await this.upload(file);

        // Remove temp file
        await unlink(file);

        await this.webhooks.success(onSuccessCallbackUrl, {
          ...payload,
          resultVideoUrl: url,
          isPaid: isPaid,
          duration: duration,
        });

        return url;
      } else {
        return file;
      }
    } catch (err) {
      await this.webhooks.error(onErrorCallbackUrl, {
        ...payload,
        error: err.message,
        stacktrace: err.stack,
      });
    }
  }

  async processTiktokVideosBotMessage(
    job: ITokTokVideosJob,
    options: ICommonJobOptions = {}
  ) {
    const {
      chatId,
      language,
      template,
      isPaid,
      duration,
      messageId,
      onSuccessCallbackUrl,
      onErrorCallbackUrl,
    } = job;

    const payload: CommonWebhookPayload = {
      chatId,
      language,
      messageId,
    };

    try {
      let file, err;
      try {
        switch (template) {
          case 'split':
            file = await this.split(job, options.outDir);
            break;
          case 'popup':
            file = await this.popup(job, options.outDir);
            break;
          default:
            throw new Error(`Template ${template} not found!`);
        }
      } catch (err) {
        this.logger.error('Rendering error: ', err);
        throw err;
      }

      if (!file) {
        this.logger.error('Rendered without file: ', file);
        throw new Error('File not created!');
      }

      // Upload to vercel storage
      if (!options.outDir) {
        const url = await this.upload(file);

        // Remove temp file
        await unlink(file);

        await this.webhooks.success(onSuccessCallbackUrl, {
          ...payload,
          resultVideoUrl: url,
          isPaid: isPaid,
          duration: duration,
        });

        return url;
      } else {
        return file;
      }
    } catch (err) {
      await this.webhooks.error(onErrorCallbackUrl, {
        ...payload,
        error: err.message,
        stacktrace: err.stack,
      });
    }
  }

  private split(editor: any, outDir = '/tmp') {
    return this.render(TEMPLATE_PATHS.SPLIT, editor);
  }

  private popup(editor: any, outDir = '/tmp') {
    return this.render(TEMPLATE_PATHS.POPUP, editor);
  }

  private getRendererOptions(
    job: ICommonRendererJob,
    outDir?: string
  ): Partial<RendererProjectSettings> {
    const notifier = _.throttle(async (_, progress: number) => {
      const percents = parseFloat((progress * 100).toFixed(2));
      await this.webhooks.progress(job.onProgressCallbackUrl, {
        progress: percents,
        chatId: job.chatId,
        language: job.language,
        messageId: job.messageId,
      });
    }, 2500);

    return {
      outDir: outDir ?? '/tmp',
      logProgress: false,
      progressCallback: notifier,
      outFile: `${randomUUID()}.mp4`,
    };
  }

  private render<T extends ICommonRendererJob>(
    projectFile: string,
    variables: T,
    outDir?: string
  ) {
    const settings = this.getRendererOptions(variables);
    return renderVideo({
      variables,
      projectFile,
      settings: {
        ...settings,
        ffmpeg: {
          ffmpegLogLevel: 'error',
          ffmpegPath: '/usr/bin/ffmpeg',
          ffprobePath: '/usr/bin/ffprobe',
        },
        puppeteer: {
          ignoreDefaultArgs: ['--mute-audio'],
          args: [
            '--no-sandbox',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',

            '--autoplay-policy=no-user-gesture-required',
            '--disable-web-security',
          ],
        },
      },
    });
  }

  private async upload(file: string) {
    const key = `${randomUUID()}.mp4`;
    return this.storage.upload(
      RESULTS_BUCKET,
      key,
      createReadStream(file),
      REMOVE_DELAY // 2h for cleanup
    );
  }
}
