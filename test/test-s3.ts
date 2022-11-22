import { filePathToTimestamp } from "../src/s3/s3";
var assert = require('assert');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // @ts-ignore
  console.log(reason.stack)
  // application specific logging, throwing an error, or other logic here
});

// 'v1/1595/1595000036'
describe('#filePathToTimestamp()', async function() {
  it('should process v1/1595/1595000036 to 1595000036', async function () {
    const path = 'v1/1595/1595000036';
    const result = filePathToTimestamp(path);
    assert(result=== 1595000036)
  });
});