#!/usr/bin/env bash
set -e

rm -rf dist/route-shapes/
mkdir -p dist/route-shapes/
echo "Running SQL query to get routes from db..."
sqlite3 -csv ./data.db   <  ./sql/route-ids.sql > temp-route-ids.txt

while read line; do

# sqlite3 -csv ./data.db > dist-json/$line.json  <<EOF
# select * from gtfs_routes where route_id = '$line' limit 1;
# EOF

sqlite3 -csv -header ./data.db > temp.csv <<EOF
select * from gtfs_shapes as shapes
where shapes.shape_id = 
(
    select distinct
    trips.shape_id
    from gtfs_routes as routes
    inner join gtfs_trips as trips on trips.route_id = routes.route_id

    where
    routes.route_id = '$line'
    limit 1
)
EOF

csvtojson temp.csv > dist/route-shapes/$line.json

echo "Done $line."
done < temp-route-ids.txt

echo "Removing temp csv and txt files... "
rm temp.csv temp-route-ids.txt
echo "Done!"
