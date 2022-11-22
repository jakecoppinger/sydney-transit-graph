// Run from ./aws-uploader/ :)
import * as fs from 'fs'
import * as request from 'request';
import { getConfig } from './utils/config';
const protobuf = require('protocol-buffers')
const messages = protobuf(fs.readFileSync('./gtfs-db/gtfs-realtime.proto'))
const uploadToAws: boolean = true;

function submitToTimestampService(timestamp: number): void {
  const { timestampServerHostname, isTimestampServerSecure, timestampServerPort } = getConfig();
  const basePath = `${isTimestampServerSecure ? 'https' : 'http'}://${timestampServerHostname}:${timestampServerPort}`;
  const url = `${basePath}/v1/add_timestamp?timestamp=${timestamp}`
  request.post(url, {
  }, (error, res, body) => {
    if (error || res === undefined) {
      console.error("Error adding timestamp to service: ", error)
      return;
    }
    console.log(`Adding timestamp to service succeeded with status code ${res.statusCode}.`)
    console.log(body)
  })
}

import { runShellCommand, parseProtobuf, makeProtobufRequest, parseObjTimestamp, saveProtobuf, }
  from './filesystem/protobuf-common'

import { timestampToFolder } from './timestamps/timestamp-operations'

const dump = (obj: any) => console.log(JSON.stringify(obj, null, 2))

const secondsBetweenDownloads = 15;
const numDownloadsUntilCacheClean = 1;

// Globals
let numDownloadsSinceCacheClean = 0;
let lastTimestamp = 0;

/**
 * Download the new data file and store it in our service.
 * This function gets called periodically
 */
async function saveData() {
  let protobufData;
  try {
    protobufData = await makeProtobufRequest();
  } catch(e) {
    console.error("Failed to fetch protocol buffer. Returning.");
    return;
  }
  let obj;
  try {
    obj = parseProtobuf(messages, protobufData);
  } catch(e) {
    console.error("Failed to parse protobuf file. Returning.");
    return;
  }

  const unixTimestamp: number = parseObjTimestamp(obj);
  console.log(`Time difference: ${lastTimestamp - unixTimestamp}`)

  // lastTimestamp is global
  lastTimestamp = unixTimestamp

  const folder = `./downloads/${timestampToFolder(unixTimestamp)}/`;
  const protobufSavePath = `${folder}${unixTimestamp}`


  process.stdout.write("Making sure output folder exists...")
  const createFolderOutput = runShellCommand(`mkdir -p ${folder}`);
  console.log(`...output folder exists:\n${createFolderOutput}`);

  if (!fs.existsSync(protobufSavePath)) {
    process.stdout.write(`${protobufSavePath} doesn't exist, writing...`)
    saveProtobuf(protobufSavePath, protobufData);
    console.log(`Done writing.`)

    submitToTimestampService(unixTimestamp);
  } else {
    console.log(`${protobufSavePath} already exists.`)
  }

  if (uploadToAws) {
    process.stdout.write("Syncing to AWS...")
    const shellCommmand = `aws s3 cp --recursive downloads/ s3://sydney-bus-visualisation/v1/`
    const s3SyncOutput = runShellCommand(shellCommmand);
    console.log(`uploaded to AWS:\n${s3SyncOutput}`);
  } else {
    console.log(`Skipping AWS upload.`);
  }

  numDownloadsSinceCacheClean++
  if (numDownloadsSinceCacheClean >= numDownloadsUntilCacheClean) {
    process.stdout.write(`Downloaded ${numDownloadsSinceCacheClean} files, deleting local files to save space...`)
    const removeFileOutput = runShellCommand('rm -r downloads/*');
    numDownloadsSinceCacheClean = 0;
    console.log(`local files removed, output: \n${removeFileOutput}.`);
  } else {
    console.log(`${numDownloadsSinceCacheClean} downloaded since last cache clean.`);
  }

  console.log(`Waiting about ${secondsBetweenDownloads}...`);
  console.log(`-----------------------------------`);
}

async function blockUntilMultipleOfSeconds(seconds: number) {
  return new Promise(function (resolve: any) {
    const blockThenClearInterval = () => {
      var date = new Date();
      const currentSeconds = date.getSeconds()
      if (currentSeconds === 0 || currentSeconds % seconds === 0) {
        console.log(`seconds is ${currentSeconds}, starting program.`)
        clearInterval(startDownloadInterval);
        resolve();
      } else {
        process.stdout.write('.')
      }
    };
    const startDownloadInterval = setInterval(blockThenClearInterval, 100);
  });
}

async function main() {
  console.log(`Waiting for a multiple of ${secondsBetweenDownloads} before starting (to rough sync with other clients :)`)
  await blockUntilMultipleOfSeconds(secondsBetweenDownloads);
  console.log("Starting downloads")

  try {
    saveData()
  } catch(error) {
    console.error("Error in saveData:");
    console.error(error);
    console.error("Continuing...");
  };

  setInterval(saveData, secondsBetweenDownloads * 1000)
}

main();
