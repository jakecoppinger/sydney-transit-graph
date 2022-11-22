#!/usr/bin/env bash
set -e

rm -rf dist/*
mkdir -p dist
mkdir -p dist/css/

# # Copy common files
# echo "Copying common files..."
# ../copy-common-files.sh

# Compile TS
echo "Compiling ts..."
./node_modules/.bin/browserify src/script.ts --fast -p tsify --debug > dist/dist.js

# Copy everything else
cp -r static/* dist/
cp -r src/libs/ dist/libs/

# Compile SCSS to CSS
./node_modules/.bin/sass src/scss/styles.scss > dist/css/styles.css

# Copy html last, so site won't load until all assets present
# cp src/about.html  dist/
cp src/index.html  dist/
cp -r src/about/ dist/about/

ls -lh dist/dist.js

echo "Done."
