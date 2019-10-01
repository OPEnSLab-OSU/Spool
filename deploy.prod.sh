#!/bin/bash

npm run build
node_modules/.bin/serve -l 3000 --ssl-cert /etc/letsencrypt/live/spool.open-sensing.org/fullchain.pem --ssl-key /etc/letsencrypt/live/spool.open-sensing.org/privkey.pem -s build &
node api/bin/www