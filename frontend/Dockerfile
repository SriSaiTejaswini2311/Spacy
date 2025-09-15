# ---------- builder ----------
    FROM node:18-alpine AS builder
    WORKDIR /app
    
    # install dependencies (full set) based on lockfile
    COPY package*.json ./
    # If you use .npmrc or private registries, copy them here as needed
    RUN npm ci
    
    # copy source and build
    COPY . .
    # build Next app (will compile TypeScript and build .next)
    RUN npm run build
    
    # ---------- runner ----------
    FROM node:18-alpine AS runner
    WORKDIR /app
    ENV NODE_ENV=production
    
    # copy package.json & package-lock.json so we can install production deps (optional)
    COPY package*.json ./
    
    # Option A: install production-only deps in final image (clean)
    RUN npm ci --only=production
    
    # copy built artifacts and public folder from builder
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/next.config.js ./next.config.js
    # If you have other runtime files (server files, env) copy them
    # COPY --from=builder /app/server.js ./server.js
    
    EXPOSE 3000
    # ensure `start` script in package.json uses `next start`
    CMD ["npm", "run", "start"]
    