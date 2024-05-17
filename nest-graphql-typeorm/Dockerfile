FROM node:20-alpine3.18 AS base

WORKDIR /app

COPY package*.json ./

FROM base as dev

RUN --mount=type=cache,target=/app/.npm \
  npm set cache /app/.npm && \
  npm install

COPY . .

CMD ["npm", "run", "start:dev"]

FROM base as production

ENV NODE_ENV production

RUN --mount=type=cache,target=/app/.npm \
  npm set cache /app/.npm && \
  npm ci --only=production


USER node

COPY --chown=node:node . .

EXPOSE 3001

RUN npm run build

CMD [ "node", "dist/main.js" ]