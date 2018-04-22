#!/bin/bash

rm -rf node_modules
rm -rf ui/node_modules

time docker build --pull -t docker.loxon.eu/infra/cloud-index:7.0.0-beta1 .
docker push docker.loxon.eu/infra/cloud-index:7.0.0-beta1
