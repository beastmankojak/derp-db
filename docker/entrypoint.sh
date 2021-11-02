#!/bin/bash

[ "$(ls -A /data/db)" ] || tar -zxvf /data/data.tar.gz -C /
/usr/local/bin/docker-entrypoint.sh $@