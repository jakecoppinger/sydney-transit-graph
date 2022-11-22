#!/usr/bin/env bash

echo "Removing bom marks..."

for file in "./raw_data/gtfs_data/"*
do
    echo "Fixing ${file}..."
    cat ${file} | awk '{ gsub(/\xef\xbb\xbf/,""); print }' > temp.csv
    cat temp.csv > ${file}
    echo "Done ${file}."
done

rm temp.csv
echo "Done."