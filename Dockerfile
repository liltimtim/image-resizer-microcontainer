FROM node

WORKDIR /usr/src/app

COPY package*.json ./

RUN mkdir -p /usr/src/app/caches

RUN npm install

COPY . .
EXPOSE 9090
CMD ["npm", "start"]