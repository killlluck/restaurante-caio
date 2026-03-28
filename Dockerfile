FROM node:18-alpine AS deps

WORKDIR /app

RUN apk add --no-cache --virtual .build-deps python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM alpine:3.21 AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache libgcc libstdc++

COPY --from=deps /usr/local/bin/node /usr/local/bin/node
COPY --from=deps /app/node_modules ./node_modules
COPY index.js ./
COPY logo.png ./
COPY views/dashboard.ejs views/login.ejs ./views/

EXPOSE 3000

CMD ["node", "index.js"]
