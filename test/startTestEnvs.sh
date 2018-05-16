#!/bin/bash

docker system prune -af

docker stack deploy -c docker-compose-good-cat1.yml test-good-cat1-1
docker stack deploy -c docker-compose-good-cat1.yml test-good-cat1-2
docker stack deploy -c docker-compose-good-cat1.yml test-good-cat1-3
docker stack deploy -c docker-compose-good-cat1.yml test-good-cat1-4

docker stack deploy -c docker-compose-good-cat2.yml test-good-cat2-1
docker stack deploy -c docker-compose-good-cat2.yml test-good-cat2-2
docker stack deploy -c docker-compose-good-cat2.yml test-good-cat2-3
docker stack deploy -c docker-compose-good-cat2.yml test-good-cat2-4
docker stack deploy -c docker-compose-good-cat2.yml test-good-cat2-5
docker stack deploy -c docker-compose-good-cat2.yml test-good-cat2-6

docker stack deploy -c docker-compose-good-cat3.yml test-good-cat3-1
docker stack deploy -c docker-compose-good-cat3.yml test-good-cat3-2

docker stack deploy -c docker-compose-higherGap.yml test-higherGap 
docker stack deploy -c docker-compose-limitLowerThanReserved.yml test-limitLowerThanReserved 
docker stack deploy -c docker-compose-missingResource.yml test-missingResource 
docker stack deploy -c docker-compose-multipleCategory.yml test-multipleCategory 
docker stack deploy -c docker-compose-noCategory.yml test-noCategory 
docker stack deploy -c docker-compose-noInfo.yml test-noInfo 
docker stack deploy -c docker-compose-allMissing.yml test-allMissing 
docker stack deploy -c docker-compose-invalidPriority.yml test-invalidPriority 

