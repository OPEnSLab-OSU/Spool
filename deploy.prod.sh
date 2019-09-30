#!/bin/bash

#

npm run build
node_modules/.bin/serve -l 3000 -s build &
node api/bin/www