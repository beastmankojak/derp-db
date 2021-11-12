#!/bin/bash
docker network ls | grep "derp-net" || docker network create -d bridge derp-net
mkdir -p "$PWD/data/db"
docker run \
  --rm \
  -v $PWD/data/db:/data/db \
  -p 27017:27017 \
  --name derp-db \
  --network derp-net \
  -d \
  beastmankojak/derp-db:latest
