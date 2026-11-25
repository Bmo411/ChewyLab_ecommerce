# syntax=docker/dockerfile:1
# Configuración pública de la tienda; admite overrides por build args.
ARG VITE_SUPABASE_URL=https://irhhoqdwagyycjxvosyu.supabase.co
ARG VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyaGhvcWR3YWd5eWNqeHZvc3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4OTQwNTksImV4cCI6MjA4MzQ3MDA1OX0.ENyUjnU-mb0Q9Wl9yJEmn9Z29AxWOTAsHtHqOvGg4i8
ARG VITE_SITE_URL=https://chewylab.blueberrieslab.com
FROM node:22-alpine AS storefront
WORKDIR /build
COPY Frontend/package.json Frontend/package-lock.json ./
RUN npm ci --include=dev --no-audit --no-fund
COPY Frontend/ ./
# Sólo variables públicas. Las claves privadas se configuran en runtime.
ARG VITE_CONTACT_EMAIL=""
ARG VITE_CONTACT_WHATSAPP=""
ARG VITE_INSTAGRAM_URL=""
ARG VITE_TIKTOK_URL=""
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_SITE_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_API_URL="" \
    VITE_SITE_URL=$VITE_SITE_URL \
    VITE_CONTACT_EMAIL=$VITE_CONTACT_EMAIL \
    VITE_CONTACT_WHATSAPP=$VITE_CONTACT_WHATSAPP \
    VITE_INSTAGRAM_URL=$VITE_INSTAGRAM_URL \
    VITE_TIKTOK_URL=$VITE_TIKTOK_URL
RUN test -n "$VITE_SUPABASE_URL" && test -n "$VITE_SUPABASE_ANON_KEY" && npm run build

FROM node:22-alpine AS production
ARG VITE_SUPABASE_URL
ARG VITE_SITE_URL
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8788 \
    STATIC_DIR=/app/public \
    WEB_URL=$VITE_SITE_URL \
    SUPABASE_URL=$VITE_SUPABASE_URL \
    COMMERCE_ENABLED=false \
    LEGAL_PUBLICATION_CONFIRMED=false \
    SEARCH_INDEXING_ENABLED=true
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
