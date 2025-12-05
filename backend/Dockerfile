FROM node:18

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install 

COPY src/ ./src
COPY public ./public

EXPOSE 8000

CMD ["node", "src/index.js"]