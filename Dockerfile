FROM node:13.12-alpine AS build
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --silent
COPY . .
RUN npm run build

FROM node:13-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=build ./usr/src/app/proto ./proto
COPY --from=build ./usr/src/app/dist ./dist
COPY --from=build ./usr/src/app/package.json ./
RUN npm install --production --silent
CMD npm start
