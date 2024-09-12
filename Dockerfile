FROM node:18

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 5000

CMD ["npm", "start"]