#!/bin/bash

#  Install-Spool.sh
#  
#
#  Created by Eli Winkelman on 7/30/20.
#  

mkdir Spool_Application
cd Spool_Application

git clone https://github.com/OPEnSLab-OSU/Spool.git

cd Spool

npm install

cd ..

echo $PWD

/bin/bash Spool/setup/Generate-Certificates.sh

