#!/usr/bin/env bash

# Taking a sql file, output to stdout the CSV for that route

cd ~/repos/sydney-bus-visualisation/database/

sqlite3 -csv ./gtfs-db/data.db -csv  -header <  ./gtfs-db/372-route.sql

# << EOF

# select * from gtfs_stops limit 10

# EOF
