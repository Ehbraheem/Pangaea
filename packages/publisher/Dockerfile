FROM node:12.16.2-alpine


ENV NODE_ENV=$NODE_ENV \
    SERVICE_PORT=$SERVICE_PORT \
    APP_DIR="/usr/src/pangaea"

WORKDIR $APP_DIR

RUN chown -R node:node $APP_DIR

COPY package.json yarn.lock ./

USER node

RUN yarn install --prod

COPY --chown=node:node . .

EXPOSE $SERVICE_PORT

CMD ["yarn", "start"]
