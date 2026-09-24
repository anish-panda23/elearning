# Dockerfile for Server
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production=false

COPY . .

RUN npx tsc

EXPOSE 5001

CMD ["npm", "start"]
