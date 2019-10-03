FROM node:12

#install openssl
RUN apt-get update \
	&& apt-get install -y openssl \
	&& rm -rf /var/lib/apt/lists/* \
	&& rm -rf /var/cache/apt/*

#Create directory for the app
WORKDIR /usr/src/app

### Install npm packages ###
COPY package*.json ./
RUN npm ci --only=production

COPY . .

### Build the react site
node_modules/.bin/react-scripts build