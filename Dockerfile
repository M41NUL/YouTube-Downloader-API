FROM node:18

# Install required packages
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python3 -m venv /venv

# Install yt-dlp inside venv
RUN /venv/bin/pip install --no-cache-dir yt-dlp

# Set PATH so yt-dlp works globally
ENV PATH="/venv/bin:$PATH"

# Work directory
WORKDIR /app

# Install node dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Start server
CMD ["node", "server.js"]
