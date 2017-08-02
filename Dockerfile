FROM node:8.2-alpine

RUN apk add --no-cache ca-certificates

WORKDIR /app
COPY package.json /app
COPY yarn.lock /app
RUN yarn

COPY . /app

CMD ["node", "index.js"]
