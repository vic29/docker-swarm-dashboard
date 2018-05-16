#!/bin/bash

rm -rf node_modules
yarn install

cd ui
rm -rf node_modules
yarn install
npm run build

cd ..
time docker build --pull -t szabobar/swarm-dashboard:1.1 -t szabobar/swarm-dashboard:latest .
docker push szabobar/swarm-dashboard:1.1
docker push szabobar/swarm-dashboard:latest
