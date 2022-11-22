#!/usr/bin/env bash
set -e

echo "Removing old DB..."
rm -f ./data2.db

importerPath="./gtfs_SQL_importer/src/"
# importerPath="/Users/jake/others_repos/gtfs_SQL_importer/src/"

# If wanting to copy in new (unpatched version) of the table spec
# rm -f gtfs_tables.sqlite
# cp ${importerPath}gtfs_tables.sqlite .

# SQLite
echo "Importing, will take some time..."
# cat ./gtfs_tables.sqlite \
#       <(python2 ${importerPath}import_gtfs_to_sql.py ./gtfs-files/ nocopy)  \
#     | sqlite3 ./data.db


echo "Create GTFS tables..."
cat ./gtfs_tables.sqlite | sqlite3 ./data2.db

echo "Deleting temp-insert-gtfs-statements.sql..."
rm -f temp-insert-gtfs-statements.sql

# echo "Create insert statements from GTFS files, will take some time..."
# python2 ${importerPath}import_gtfs_to_sql.py ./gtfs-files/ nocopy > temp-insert-gtfs-statements.sql

# echo "Run the insert GTFS statements on the DB..."
# cat temp-insert-gtfs-statements.sql | sqlite3 ./data2.db

echo "Creating and insert statements from GTFS files, will take some time..."
python2 ${importerPath}import_gtfs_to_sql.py ./gtfs-files/ nocopy | sqlite3 ./data2.db

echo "Finished create-sql-database.sh without errors."

# POSTGRES

# cat ${importerPath}gtfs_tables.sql \
#   <(python ${importerPath}import_gtfs_to_sql.py ./raw_data/gtfs_data) \
#   ${importerPath}gtfs_tables_makeindexes.sql \
#   ${importerPath}vacuumer.sql \
# | psql sydney_gtfs