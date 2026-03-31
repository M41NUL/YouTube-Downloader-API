FROM node:18

RUN apt-get update && apt-get install -y ffmpeg python3-pip
RUN pip3 install yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "server.js"]
