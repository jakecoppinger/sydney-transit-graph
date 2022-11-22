import { getAvailableTimestamps, timestampsToFilepaths } from "../src/s3/file-choice";

var assert = require('assert');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // @ts-ignore
  console.log(reason.stack)
  // application specific logging, throwing an error, or other logic here
});

const getTimestampsForPrefixOrdered = (folder: number): Promise<number[]> => {
  const getTimestamps = (folder: number): number[] => {
    if (folder === 1) {
      return [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    } else if (folder === 2) {
      return [20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
    } else if (folder === 3) {
      return [30, 31, 32, 33, 34, 35, 36, 37, 38, 39];
    }
    return [];
  }
  return new Promise((resolve, reject) => {
    resolve(getTimestamps(folder));
  })
}
const getTimestampsForPrefixMissing = (folder: number): Promise<number[]> => {
  const getTimestamps = (folder: number): number[] => {
    if (folder === 1) {
      return [11, 13, 15, 17, 19];
    } else if (folder === 2) {
      return [21, 23, 25, 27, 29];
    } else if (folder === 3) {
      return [31, 33, 35, 37, 39];
    }
    return [];
  }
  return new Promise((resolve, reject) => {
    resolve(getTimestamps(folder));
  })
}
const getTimestampsForPrefixUnordered = (folder: number): Promise<number[]> => {
  const getTimestamps = (folder: number): number[] => {
    if (folder === 1) {
      return [19, 18, 17, 16, 15, 14, 13, 12, 11, 10];
    } else if (folder === 2) {
      return [29, 28, 27, 26, 25, 24, 23, 22, 21, 20];
    } else if (folder === 3) {
      return [39, 38, 37, 36, 35, 34, 33, 32, 31, 30];
    }
    return [];
  }
  return new Promise((resolve, reject) => {
    resolve(getTimestamps(folder));
  })
}
const getTimestampsForPrefixMissingPrefixes = (folder: number): Promise<number[]> => {
  const getTimestamps = (folder: number): number[] => {
    if (folder === 1) {
      return [17, 16, 15, 14, 13, 11, 10];
    } else if (folder === 3) {
      return [37, 36, 35, 34, 33, 31, 30];
    } else if (folder === 4) {
      return [];
    }
    return [];
  }
  return new Promise((resolve, reject) => {
    resolve(getTimestamps(folder));
  })
}


describe('#getAvailableTimestamps()', async function () {
  it(`should get no files if files don't exist for range`, async function () {
    const timestamps: number[] = await getAvailableTimestamps(1234, 2345, 10);
    assert(timestamps.toString() === [].toString());
  })
  it(`should receive (nearly) correct number of files if they exist`, async function () {
    const timestamps: number[] = await getAvailableTimestamps(1597574096, 1597574576, 10);
    const expected = [1597574096,
      1597574156,
      1597574216,
      1597574276,
      1597574336,
      1597574396,
      1597574456,
      1597574516,
      1597574576];
    assert(timestamps.toString() === expected.toString());
  })
});

describe('#timestampsToFilepaths()', async function() {
  it(`convert empty list to empty list`, async function () {
    const filenames: string[] = timestampsToFilepaths([]);
    assert(filenames.toString() === [].toString());
  })
  it(`convert list of three timestamps correctly`, async function () {
    const filenames: string[] = timestampsToFilepaths([
      1597574216,
      1597574276,
      1597574336,
    ]);
    assert(filenames.toString() === [
      'v1/1597/1597574216',
      'v1/1597/1597574276',
      'v1/1597/1597574336'
    ].toString());
  })
});