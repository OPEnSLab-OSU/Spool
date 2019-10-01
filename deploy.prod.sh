#!/bin/bash

npm run build
node_modules/.bin/serve -l 3000 --ssl-cert /run/secrets/server.crt --ssl-key /run/secrets/server.key -s build &
node api/bin/www