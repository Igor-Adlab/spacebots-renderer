import { ICommonRendererJob } from './common-renderer-job.interface';
export interface ITokTokVideosJob extends ICommonRendererJob {
  template: 'split' | 'popup';
}
