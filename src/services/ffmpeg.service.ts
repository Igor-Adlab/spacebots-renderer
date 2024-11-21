import { resolve } from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { randomUUID } from 'crypto';

const OUTPUT_DIR = '/tmp';

export class FfMpegService {
  extractAudio(videoPath: string): Promise<string> {
    const outputFilePath = resolve(OUTPUT_DIR, `${randomUUID()}.mp4`);
    return new Promise<string>((resolve, reject) => {
      ffmpeg(videoPath)
        .output(outputFilePath)
        .noVideo()
        .on('end', () => resolve(outputFilePath))
        .on('error', (err) => reject(err))
        .run();
    });
  }
}
