import { ICommonRendererJob } from './common-renderer-job.interface';

export interface ICommonVideoCaptionsJob extends ICommonRendererJob {
  videoUrl: string;
}

export enum CaptionSource {
  Text = 'text',
  Video = 'video',
}

// When user wants to add captions to existing video
export type IVideoCaptionJobFromVideo = ICommonVideoCaptionsJob & {
  source: CaptionSource;
};

// When user wants to create story on top of dummy video
export type IVideoCaptionJobFromText = ICommonVideoCaptionsJob & {
  text: string;
  source: CaptionSource;
};

export type IVideoCaptionJob =
  | IVideoCaptionJobFromVideo
  | IVideoCaptionJobFromText;
