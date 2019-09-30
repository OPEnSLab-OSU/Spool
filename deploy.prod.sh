#!/bin/bash

#

npm run build
node_modules/.bin/serve -s build &
node api/bin/www