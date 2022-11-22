#!/usr/bin/env node

import {getQuantisedUpdates} from './business-layer';
async function main() {
  const startTimestamp = 1575718306 // 1557987879
  const endTimestamp = 1579303383 //1557987894
  const bus = '372'

  const results = await getQuantisedUpdates(bus,startTimestamp,endTimestamp,5)
  console.log({results})
}
main()
