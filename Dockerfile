# Install dependencies only when needed
FROM node:22-alpine AS deps
WORKDIR /app

# Install system dependencies
# Install dependencies
COPY package.json package-lock.json* ./
# --ignore-scripts تمنع تشغيل postinstall/preinstall/uninstall scripts
RUN npm ci --ignore-scripts

# Rebuild the source code only when needed
FROM node:22-alpine AS builder
WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN npx prisma generate
# Build the Next.js app
RUN npm run build

# Production image, copy all necessary files
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy only the output of the build with proper ownership
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json

# Use non-root node user
USER node

# Expose the port Next.js will run on
EXPOSE 3002

# Start the Next.js app
CMD ["npx", "next", "start"]