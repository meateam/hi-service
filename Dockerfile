FROM node:10.16.0-alpine AS build
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "./"]
COPY . .
RUN npm run build

FROM node:10.16.0-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=build ./usr/src/app/proto ./proto
COPY --from=build ./usr/src/app/dist ./dist
COPY --from=build ./usr/src/app/package.json ./
# Use the local node_modules because the package @rocket.chat/sdk drops the build due to an unknown problem with it
COPY --from=build ./usr/src/app/node_modules ./node_modules
CMD npm start
