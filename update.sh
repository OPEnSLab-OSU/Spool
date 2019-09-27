#!/bin/bash

# get a new version of the application
git pull origin/production

# go to the parent directory
cd ..

# build the new app.
docker-compose down
docker-compose up -f docker-compose.yml -f docker-compose.prod.yml --build &
