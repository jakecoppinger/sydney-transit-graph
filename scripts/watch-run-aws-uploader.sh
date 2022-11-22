#!/usr/bin/env bash
find src/*/*.ts test/**/*.ts *.sh package.json | entr -rc -s "yarn build && yarn run start-aws-uploader"
