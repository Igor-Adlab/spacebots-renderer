FROM docker.io/node:22

WORKDIR /app

# Set environment variables
ENV DONT_WRITE_TO_META_FILES=true
ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV DEBIAN_FRONTEND=noninteractive
ENV FFPROBE_PATH=/usr/local/bin/ffprobe
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install necessary dependencies, including FFmpeg, FFprobe, and X server dependencies
RUN apt-get update && \
    apt-get install -y \
    ffmpeg \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libx11-xcb1 \
    libx11-6 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxtst6 \
    libxrender1 \
    libxshmfence1 \
    xvfb \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-keyring.gpg && \
    sh -c 'echo "deb [signed-by=/usr/share/keyrings/google-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list' && \
    apt-get update && apt-get install -y google-chrome-stable && \
    rm -rf /var/lib/apt/lists/*

RUN groupadd --system space-renderer-job && \
    useradd --system --gid space-renderer-job --home-dir /app --shell /bin/bash space-renderer-job

COPY dist/space-renderer-job space-renderer-job/

RUN chown -R space-renderer-job:space-renderer-job .

COPY package*.json /app/space-renderer-job/

RUN cd /app/space-renderer-job/ && yarn

COPY renderer-cli /app/space-renderer-job/renderer-cli
RUN chmod +x /app/space-renderer-job/renderer-cli

RUN yarn add puppeteer
RUN node /app/node_modules/puppeteer/install.mjs

WORKDIR /app/space-renderer-job
ENTRYPOINT ["./renderer-cli"]
