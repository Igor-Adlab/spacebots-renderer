import { asClass, asValue, createContainer, Lifetime } from 'awilix';
import {
  GcpStorageService,
  RendererService,
  WebhooksService,
  CaptionsService,
  FfMpegService,
} from './services';
import pino from 'pino';
import Redis from 'ioredis';
import { logger } from './logger';
import { redis } from './redis';

export const diContainer = createContainer<DiCradle>();

export interface DiCradle {
  // Globals
  redis: Redis;
  logger: pino.Logger;

  ffmpeg: FfMpegService;
  renderer: RendererService;
  webhooks: WebhooksService;
  captions: CaptionsService;
  storage: GcpStorageService;
}

diContainer.register({
  redis: asValue(redis),
  logger: asValue(logger),

  ffmpeg: asClass(FfMpegService, { lifetime: Lifetime.SINGLETON }),
  captions: asClass(CaptionsService, { lifetime: Lifetime.SINGLETON }),
  webhooks: asClass(WebhooksService, { lifetime: Lifetime.SINGLETON }),
  renderer: asClass(RendererService, { lifetime: Lifetime.SINGLETON }),
  storage: asClass(GcpStorageService, { lifetime: Lifetime.SINGLETON }),
});
