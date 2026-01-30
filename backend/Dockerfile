FROM node:18-alpine

WORKDIR /app

# Copy package files (wildcard pattern makes lock file optional)
COPY package*.json ./

RUN npm install --only=production && npm cache clean --force

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
