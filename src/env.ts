import { config } from 'dotenv';
import { bool, cleanEnv, str } from 'envalid';

config();

export const env = cleanEnv(process.env, {
  BEARER_AUTH_TOKEN: str({ desc: 'Auth Bearer token for webhooks' }),

  REDIS_URL: str(),

  GCP_BUCKET: str(),
  RUN_GCP_STORAGE_CLEANER: bool({ default: true }),

  DEEPGRAM_API_KEY: str(),
  ELEVENLABS_API_KEY: str(),
  OPENAI_API_KEY: str(),

  // TikTok Videos job templates
  TEMPLATE_SPLIT: str({
    default: '../assets/templates/tiktok-videos/split.tsx',
  }),
  TEMPLATE_POPUP: str({
    default: '../assets/templates/tiktok-videos/popup.tsx',
  }),
  TEMPLATE_REACTION: str({
    default: '../assets/templates/tiktok-videos/reaction.tsx',
  }),

  TEMPLATE_CAPTIONS: str({
    default: '../assets/templates/captions/project.tsx',
  }),
});
