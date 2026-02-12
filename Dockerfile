# -------- BUILD --------
FROM node:22-bookworm-slim AS build
WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV HUSKY=0
ENV CI=1

RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build
RUN pnpm prune --prod --ignore-scripts


# -------- RUNTIME --------
FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

RUN corepack enable
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/tsconfig.build.json ./tsconfig.build.json
COPY --from=build /app/package.json ./
COPY --from=build /app/.env.prd ./.env.prd

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["pnpm", "run", "start:prod"]
