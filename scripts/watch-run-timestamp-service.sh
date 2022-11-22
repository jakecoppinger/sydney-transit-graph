#!/usr/bin/env bash
find src/*.ts src/*/*.ts test/*.ts *.sh package.json | entr -rc -s "yarn build && yarn run start-timestamp-service"
