FROM node:22-alpine

WORKDIR /app

# copy root package.json + lockfile
COPY package*.json ./

# copy workspace package.json files (for caching)
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

# install ALL workspace deps
RUN npm install

# now copy actual code
COPY . .

WORKDIR /app/shared
RUN npm run build

# build backend
WORKDIR /app/backend
RUN npm run build

EXPOSE 3001
CMD ["node", "dist/index.js"]