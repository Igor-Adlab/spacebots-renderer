import { Logger } from 'pino';
import { v4 as uuid } from 'uuid';
import { createReadStream } from 'fs';

import { generateAudio, getWordTimestamps } from '../utils';
import { GcpStorageService } from './gcp-storage.service';
import { writeFile } from 'fs/promises';

export class CaptionsService {
  private readonly logger: Logger;
  private readonly storage: GcpStorageService;

  constructor({ logger, storage }) {
    this.storage = storage;
    this.logger = logger.child({ name: CaptionsService.name });
  }

  async createAssets(text: string, voiceName: string = 'Sarah') {
    const audioFileName = `${uuid()}.wav`;
    const audioFilePath = `/tmp/${audioFileName}`;

    await generateAudio(text, voiceName, audioFilePath);

    this.logger.info(`Audio generated: ${audioFilePath}`);

    // TODO: add expiration time
    const audioUrl = await this.storage.upload(
      'audios',
      audioFileName,
      createReadStream(audioFilePath)
    );

    const words = await getWordTimestamps(audioFilePath);
    return { words, text, audio: audioUrl };
  }
}
