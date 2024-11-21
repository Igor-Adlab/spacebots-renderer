import { Bucket, Storage as GoogleStorage } from '@google-cloud/storage';
import { Job, Queue } from 'bullmq';
import { env } from '../env';
import { join } from 'path';
import { Readable } from 'stream';
import { Logger } from 'pino';

const STORAGE_CLEANER_QUEUE = '@storage_cleaner';

type RemovePayload = { folder: string; key: string };

export class GcpStorageService {
  private readonly queue: Queue;
  private readonly bucket: Bucket;
  private readonly $client: GoogleStorage;
  private logger: Logger;

  constructor({ redis, logger }) {
    this.$client = new GoogleStorage();
    this.bucket = this.$client.bucket(env.GCP_BUCKET);
    this.queue = new Queue(STORAGE_CLEANER_QUEUE, {
      connection: redis,
    });

    this.logger = logger.child({ service: GcpStorageService.name });
  }

  get client() {
    this.logger.warn('Direct access to GCP Storage client');
    return this.$client;
  }

  async upload(
    folder: string,
    key: string,
    content: Readable | Buffer | string,
    removeDelay = 0
  ) {
    const filePath = this.getFilePath(folder, key);
    this.logger.info(`Uploading ${key} to ${folder}`);

    try {
      const file = this.bucket.file(filePath);

      if (content instanceof Buffer || typeof content === 'string') {
        // Uploading a Buffer or string directly
        await file.save(content);
      } else if (content && typeof content.pipe === 'function') {
        // Handling a Readable stream
        await new Promise((resolve, reject) => {
          content
            .pipe(file.createWriteStream())
            .on('finish', resolve)
            .on('error', reject);
        });
      } else {
        throw new Error(
          'Unsupported content type. Expected a Readable, Buffer, or string.'
        );
      }

      if (removeDelay) {
        this.logger.info(`Cleanup scheduled for ${filePath}`);
        await this.queue.add('clean', { folder, key }, { delay: removeDelay });
      }

      this.logger.info(`File uploaded to ${filePath}`);
      return `https://storage.googleapis.com/${env.GCP_BUCKET}/${filePath}`;
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      throw error;
    }
  }

  async remove({ folder, key }: RemovePayload) {
    const filePath = this.getFilePath(folder, key);

    this.logger.info(`Removing ${key} in ${folder}`);
    try {
      await this.bucket.file(filePath).delete();
      this.logger.info(`File ${key} deleted from ${folder}`);
      return true;
    } catch (error) {
      this.logger.error('Error deleting file:', error);
      throw error;
    }
  }

  private getFilePath(folder: string, key: string) {
    return join(folder, key);
  }
}
