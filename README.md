# Spacebots Renderer 🚀🎬  

A simple video rendering tool for the [SpaceBots API](https://github.com/Igor-Adlab/spacebots-api), designed to run efficiently on Google Cloud Run (8 CPU + 8 GB RAM — thanks, Google Cloud, for these limits 🙌).  

## Features  

- **Dummy TikTok Videos** 🎵🎮  
  Generate short, engaging TikTok-style videos by combining any audio/video with dynamic gameplay backgrounds. ADHD-friendly content creators, rejoice!  

- **Text-to-Video or Audio-to-Video** 📝🎥  
  Turn text or audio into videos by adding quirky background visuals, like carpet cleaning or GTA gameplay. Perfect for keeping things fun and chaotic.  

- **Fast and Scalable** ⚡  
  Powered by Google Cloud Run, the tool handles demanding rendering tasks with ease, scaling automatically to meet your needs.  

## How It Works  

1. **Input**: Provide a combination of text, audio, or video along with a desired template or background type.  
2. **Processing**: The renderer stitches these elements together using a custom pipeline.  
3. **Output**: A rendered video is uploaded to Google Cloud Storage, ready for sharing or further processing.  

## Prerequisites  

- **Google Cloud Account**: Set up with Cloud Run and Storage permissions.  
- **Node.js**: For local development and testing.  