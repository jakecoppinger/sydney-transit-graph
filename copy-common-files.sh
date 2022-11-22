#!/usr/bin/env bash
set -e

pushd ~/repos/sydney-bus-visualisation
# cp common/interfaces.ts frontend/src/
# cp common/interfaces.ts backend/src/

# cp common/config.ts src/utils/
# cp common/config.ts frontend/src/utils/

cp src/utils/config.ts frontend/src/utils/
cp src/interfaces/interfaces.ts frontend/

popd

echo "Done copying common files."
