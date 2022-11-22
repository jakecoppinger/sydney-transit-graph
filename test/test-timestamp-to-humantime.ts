import { timestampToHumantime } from "../src/timestamps/timestamp-to-humantime";
var assert = require('assert');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // @ts-ignore
  console.log(reason.stack)
  // application specific logging, throwing an error, or other logic here
});

describe('#timestampToHumantime()', async function () {
  it('should convert 1595487110 to 2020-07-23T16:53:17+10:00', function () {
    const result: string = timestampToHumantime(1595487197);
    assert(result === "2020-07-23T16:53:17+10:00");
  });
});
