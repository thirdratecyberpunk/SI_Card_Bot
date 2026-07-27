# Stage 1: install dependencies
FROM node:20-slim AS deps
WORKDIR /usr/src/app

# Install system dependencies required by node-canvas
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: app
FROM node:20-slim
WORKDIR /usr/src/app

# Install runtime libs for canvas
RUN apt-get update && apt-get install -y \
    libcairo2 \
    libpango-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# create non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "index.js"]
