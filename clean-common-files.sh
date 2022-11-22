#!/usr/bin/env bash
set -e

rm database/src/marey-db-connector.ts
rm server/src/marey-db-connector.ts

rm database/src/interfaces.ts
rm server/src/interfaces.ts
echo "Dony removing common files."
