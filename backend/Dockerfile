FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build
RUN mkdir -p /data

EXPOSE 3333

CMD ["node", "dist/server.js"]