const fs = require('fs')
const protobuf = require('protocol-buffers')

const messages = protobuf(fs.readFileSync('schema.proto'))

const obj = {
  first_name: 'John',
  last_name: 'Smith'
}

const buf = messages.User.encode(obj)

fileDescriptor = fs.openSync('output', 'w')
fs.writeSync(fileDescriptor, buf)
fs.closeSync(fileDescriptor)

console.log('Wrote protocol buffer to file.')
