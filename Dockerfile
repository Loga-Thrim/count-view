FROM node:12.18-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package.json .
RUN npm install -g nodemon
RUN npm install
COPY . .
EXPOSE 91
CMD ["nodemon", "app.js"]