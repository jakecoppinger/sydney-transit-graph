var assert = require('assert');
// const { execSync } = require('child_process');
import { debounceTimestamps, timestampToFolder, timestampSelection } from '../src/timestamps/timestamp-operations';

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // @ts-ignore
  console.log(reason.stack)
  // application specific logging, throwing an error, or other logic here
});

describe('#timestampSelection()', async function () {
  it('should return no timestamps if none available', function () {
    const timestamps = []
    const selectedTimestamps = timestampSelection(timestamps, 0, 10, 6);

    const expectedTimestamps = []
    assert(JSON.stringify(expectedTimestamps) == JSON.stringify(selectedTimestamps));
  });
  it('should return no timestamps if none available in range', function () {
    const timestamps = [1, 2]
    const selectedTimestamps = timestampSelection(timestamps, 3, 10, 6);
    const expectedTimestamps = []
    assert(JSON.stringify(expectedTimestamps) == JSON.stringify(selectedTimestamps));
  });
  it('should return some timestamps if requested range is larger than available', function () {
    const timestamps = [1, 2, 3, 4, 5]
    // The guessed interval will be dodgy because we're serching betwen 0 and 10!
    const selectedTimestamps = timestampSelection(timestamps, 0, 10, 6);

    const expectedTimestamps = [1, 3, 5]
    assert(JSON.stringify(expectedTimestamps) == JSON.stringify(selectedTimestamps));
  });

  it('should return timestamps within range if there are less than given quantity', function () {
    const timestamps = [1, 2, 3, 4, 5]
    const selectedTimestamps = timestampSelection(timestamps, 1, 3, 6);

    const expectedTimestamps = [1, 2, 3]
    assert(JSON.stringify(expectedTimestamps) == JSON.stringify(selectedTimestamps));
  });
  it('should return correct quantity of timestamps when more available', function () {
    const timestamps = [1, 2, 3, 4, 5, 6, 7]
    const selectedTimestamps = timestampSelection(timestamps, 1, 7, 3);

    const expectedTimestamps = [1, 4, 7]
    assert(JSON.stringify(expectedTimestamps) == JSON.stringify(selectedTimestamps));
  });
  it(`should return equally spaced and the end number`, function () {
    const timestamps = [1, 2, 3, 4, 5, 6]
    const selectedTimestamps = timestampSelection(timestamps, 1, 6, 3);

    const expectedTimestamps = [1, 3, 5]
    assert(JSON.stringify(expectedTimestamps) == JSON.stringify(selectedTimestamps));
  });

  it(`should return single timestamp if one one requested`, function () {
    const timestamps = [
      1603933828,
      1603933843,
      1603933858,
      1603933873,
      1603933888,
      1603933903,
      1603933918,
      1603933933,
      1603933948,
      1603933963
    ]
    const selectedTimestamps = timestampSelection(timestamps, 1603933828, 1603933963, 1);

    const expectedTimestamps = [1603933828]
    assert(JSON.stringify(expectedTimestamps) == JSON.stringify(selectedTimestamps));
  });


})

describe('#debounceTimestamps()', async function () {
  describe('just timestamps', async function () {
    it('should return all if all deltas larger than interval', function () {
      const timestamps = [0, 10, 20, 30, 40].map(num => num.toString());
      const new_timestamps = debounceTimestamps(timestamps, 1);
      assert(JSON.stringify(new_timestamps) == JSON.stringify(timestamps));
    });
    it('should return half if all deltas exactly interval', function () {
      const timestamps = [0, 10, 20, 30, 40].map(num => num.toString());
      const new_timestamps = debounceTimestamps(timestamps, 10);
      const expected_new_timestamps = [0, 20, 40]
        .map(num => num.toString());
      assert(JSON.stringify(new_timestamps) ==
        JSON.stringify(expected_new_timestamps));
    });
  });

  describe('full timestamp paths', async function () {
    it('should return half if all deltas exactly interval', function () {
      const timestamps = [
        'data/protobuf-archive/bus/0',
        'data/protobuf-archive/bus/10',
        'data/protobuf-archive/bus/20',
        'data/protobuf-archive/bus/30',
        'data/protobuf-archive/bus/40',
      ];
      const new_timestamps = debounceTimestamps(timestamps, 10);
      const expected_new_timestamps = [
        'data/protobuf-archive/bus/0',
        'data/protobuf-archive/bus/20',
        'data/protobuf-archive/bus/40',
      ];
      assert(JSON.stringify(new_timestamps) ==
        JSON.stringify(expected_new_timestamps));
    });
  });
});
describe('timestampToFolder()', async function () {
  it('should generate the correct folder', function () {
    const folder: string = timestampToFolder(1592986853);
    assert(folder === "1592");
  });
});
