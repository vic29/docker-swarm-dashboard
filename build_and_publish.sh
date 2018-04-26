#!/bin/bash

rm -rf node_modules
rm -rf ui/node_modules

time docker build --pull -t szabob/swarm-dashboard:1.0 -t szabob/swarm-dashboard:latest .
docker push szabob/swarm-dashboard:1.0
docker push szabob/swarm-dashboard:latest
