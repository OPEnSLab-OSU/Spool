#!/usr/bin/env bash

echo "
----------------------
  NODE & NPM
----------------------
"

# get nodejs 12

sudo apt update
sudo apt-get install curl
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "
----------------------
  MONGODB
----------------------
"

# import mongodb 4.0 public gpg key
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4

# create the /etc/apt/sources.list.d/mongodb-org-4.0.list file for mongodb
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list

# reload local package database
sudo apt-get update

# install the latest version of mongodb
sudo apt-get install -y mongodb-org

# start mongodb
sudo systemctl start mongod

# set mongodb to start automatically on system startup
sudo systemctl enable mongod

echo "
---------------------
	SPOOL
---------------------
"

git clone https://github.com/OPEnSLab-OSU/Spool.git
cd Spool
npm install

echo "
---------------------
      IP TABLES
---------------------
"

sudo iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-ports 3000

sudo iptables -t nat -A OUTPUT -p tcp --dport 443 -o lo -j REDIRECT --to-port 3000

sudo apt-get install -y iptables-persistent

echo "
---------------------
       CLEANUP
---------------------
"

sudo apt autoremove -y