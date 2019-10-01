#!/bin/bash

cd ~/app/Spool/
# get a new version of the application
git checkout production
git pull

# go to the parent directory
cd ..

# build the new app.
sudo docker-compose down
sudo docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
