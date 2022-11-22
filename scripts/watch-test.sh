#!/usr/bin/env bash
find src/*.ts src/**/*.ts test/*.ts test/*.ts frontend/test/*.ts *.sh package.json | entr -rc -s "yarn test"
