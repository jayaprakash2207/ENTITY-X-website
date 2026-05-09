FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Copy source
COPY . .

# Create DB directory
RUN mkdir -p /app/database

EXPOSE 4000

CMD ["node", "server.js"]
