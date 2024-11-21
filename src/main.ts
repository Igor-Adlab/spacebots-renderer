import { isEmpty } from 'lodash';
import { program } from 'commander';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { v4 as uuid } from 'uuid';
import { diContainer } from './di-container';
import {
  CaptionSource,
  ITokTokVideosJob,
  IVideoCaptionJob,
} from './interfaces';
import { generateAudio, getWordTimestamps } from './utils';
import { createReadStream } from 'fs';

async function getInputSettings<T extends Record<string, any>>({
  file,
  input,
}): Promise<T> {
  if (!file && !input) {
    throw new Error(`No settings for tiktok video`);
  }

  let settings: Record<string, any> = {};
  try {
    settings = JSON.parse(input);
  } catch {}

  settings = isEmpty(settings)
    ? JSON.parse(await readFile(resolve(process.cwd(), file), 'utf-8'))
    : JSON.parse(input);

  if (isEmpty(settings)) {
    throw new Error(`Settings are empty`);
  }

  return settings as T;
}

program
  .version('0.0.1')
  .description('Space renderer job')
  .description('Yet another video rendering tool');

// TikTok videos rendering
program
  .command('tiktok-video')
  .option('-t, --template <string>', 'Template: "split" or "popup"', 'split')
  .option('-o, --outDir <string>', 'Output path')
  .option('-f, --file <string>', 'Path to input JSON file')
  .option(
    '-i, --input <string>',
    'TikTok Videos Editor options - JSON format',
    '{}'
  )
  .action(async ({ file, input, outDir }) => {
    const renderer = diContainer.resolve('renderer');

    const settings = await getInputSettings<ITokTokVideosJob>({ file, input });
    const filePath = await renderer.processTiktokVideosBotMessage(settings, {
      outDir,
      upload: !outDir,
    });

    console.log({ filePath });
  });

program
  .command('video-captions')
  .option('-o, --outDir <string>', 'Output path')
  .option('-s, --sample <string>', 'Prepared data')
  .option('-f, --file <string>', 'Path to input JSON file')
  .option(
    '-i, --input <string>',
    'TikTok Videos Editor options - JSON format',
    '{}'
  )
  .action(async ({ file, input, outDir, sample }) => {
    const ffmpeg = diContainer.resolve('ffmpeg');
    const storage = diContainer.resolve('storage');
    const renderer = diContainer.resolve('renderer');

    const REMOVE_DELAY = 120 * 60 * 1000;

    if (sample) {
      const data = await readFile(resolve(process.cwd(), sample), 'utf-8');

      const payload = JSON.parse(data);
      const filePath = await renderer.processVideoCaptionsBotMessage(payload, {
        upload: false,
        outDir,
      });

      return console.log(`Prepared video: ${filePath}`);
    }

    const settings = await getInputSettings<IVideoCaptionJob>({ file, input });

    let audioPath;
    switch (settings.source) {
      case CaptionSource.Text:
        const audioFileName = `${uuid()}.wav`;
        audioPath = `/tmp/${audioFileName}`;

        await generateAudio(settings.text, 'Brian', audioPath).catch((err) => {
          console.log('Error: ', err);
          audioPath = '';
        });
        break;
      case CaptionSource.Video:
        audioPath = await ffmpeg.extractAudio(settings.videoUrl);
        break;
      default:
        throw new Error(`Unsoported source: ${settings.source}`);
    }

    if (!audioPath) {
      throw new Error(`Can not generate audio`);
    }

    const words = await getWordTimestamps(audioPath);
    const audioUrl = await storage.upload(
      'audios',
      `${uuid()}.wav`,
      createReadStream(audioPath),
      REMOVE_DELAY
    );

    const payload = { ...settings, words, audioUrl };

    const filePath = await renderer.processVideoCaptionsBotMessage(payload, {
      upload: false,
      outDir,
    });

    console.log(`Captions result: ${filePath}`);
  });

program.parse();
