# syntax=docker/dockerfile:1
FROM node:22-alpine AS storefront
WORKDIR /build
COPY Frontend/package.json Frontend/package-lock.json ./
RUN npm ci --include=dev --no-audit --no-fund
COPY Frontend/ ./
# Sólo variables públicas. Las claves privadas se configuran en runtime.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_SITE_URL=https://chewylab.blueberrieslab.com
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_API_URL="" \
    VITE_SITE_URL=$VITE_SITE_URL
RUN test -n "$VITE_SUPABASE_URL" && test -n "$VITE_SUPABASE_ANON_KEY" && npm run build

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8788 \
    STATIC_DIR=/app/public
COPY api/package.json api/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY --chown=node:node api/src/ ./src/
COPY --chown=node:node api/scripts/ ./scripts/
COPY --from=storefront --chown=node:node /build/dist/ ./public/
USER node
EXPOSE 8788
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.mjs"]
