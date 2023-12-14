#!/usr/bin/env sh
npm i

npm run build

pm2 delete server
pm2 start 'npm run start' --name server  -- --port 3000
