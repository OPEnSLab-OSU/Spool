#!/bin/bash

#
npm run build
serve -s build &
node api/bin/www