#!/usr/bin/env bash
set -e

# Taking a sql file, output to stdout the CSV for that route

sqlite3 -csv ./data.db -csv  -header <  ./372-route.sql

# << EOF

# select * from gtfs_stops limit 10

# EOF
