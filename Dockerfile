FROM node:18

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment (IMPORTANT)
RUN python3 -m venv /opt/venv

# Activate venv and install yt-dlp inside it
RUN /opt/venv/bin/pip install --no-cache-dir yt-dlp

# Add venv to PATH
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "server.js"]
