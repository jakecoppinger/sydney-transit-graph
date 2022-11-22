#!/usr/bin/env node
const fs = require('fs')
const protobuf = require('protocol-buffers')

if (process.argv.length != 3) {
  console.error(`Missing or overloaded arguments.`)
  process.exit(1)
}

const filename = process.argv[2]
const messages = protobuf(fs.readFileSync('gtfs-db/gtfs-realtime.proto'))
const buf = fs.readFileSync(filename)
const obj = messages.FeedMessage.decode(buf)

console.log(JSON.stringify(obj, null, 2))
