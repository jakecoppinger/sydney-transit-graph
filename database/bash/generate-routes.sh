#!/usr/bin/env bash
set -e
rm -rf dist/routes/
mkdir -p dist/routes/

echo "Running SQL query to get routes from db..."
sqlite3 -csv ./data.db  -header <  ./sql/all-routes.sql > temp.csv
echo "Converting csv to json..."
csvtojson temp.csv > dist/routes/routes.json
echo "Removing temp csv file... "
rm temp.csv
echo "Done!"
