#!/usr/bin/env bash

rm -f ./gtfs-database/data.db

importerPath="/Users/Jake/others_repos/gtfs_SQL_importer/src/"

# SQLite
cat ./2-generate-route-csv/gtfs_tables.sqlite \
      <(python ${importerPath}import_gtfs_to_sql.py ./raw_data/gtfs_data nocopy)  \
    | sqlite3 ./gtfs-database/data.db

# cat ./3-route-progress/gtfs_tables.sqlite \


# POSTGRES

# cat ${importerPath}gtfs_tables.sql \
#   <(python ${importerPath}import_gtfs_to_sql.py ./raw_data/gtfs_data) \
#   ${importerPath}gtfs_tables_makeindexes.sql \
#   ${importerPath}vacuumer.sql \
# | psql sydney_gtfs