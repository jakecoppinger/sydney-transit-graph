const fs = require('fs')
const protobuf = require('protocol-buffers')

const messages = protobuf(fs.readFileSync('gtfs-realtime.proto'))

const buf = fs.readFileSync('data')
const obj = messages.FeedMessage.decode(buf)

console.log('Buffer:', buf)
console.log('Object:', JSON.stringify(obj, null, 2))
