FROM node:8.9.1

RUN mkdir -p /opt/app
WORKDIR /opt/app

RUN npm install

CMD ["npm", "start"]
