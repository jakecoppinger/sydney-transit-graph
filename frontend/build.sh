#!/usr/bin/env bash
set -e

# Copy common files
echo "Copying common files..."
cp ../src/interfaces/interfaces.ts src/
cp ../src/utils/config.ts src/utils/

# Patch p5js to use minified version
 cat node_modules/p5/package.json | sed -E 's#"main": "./lib/p5.js"#"main": "./lib/p5.min.js"#' > test.txt
 mv test.txt node_modules/p5/package.json

./after-watch-build.sh
