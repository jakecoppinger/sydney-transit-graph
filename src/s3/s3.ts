import * as AWS from 'aws-sdk';
import { S3ObjectList } from "../interfaces/interfaces";
import * as fs from 'fs'

export function initialiseAWS(): void {
  AWS.config.update({
    accessKeyId: 'KEY_ID',
    secretAccessKey: 'SECRET_KEY',
    region: 'ap-southeast-2'
  });
}

/**
 * Takes the first 4 numbers of a timestamp to create a folder.
 * Each folder holds about 12 days of data
 * Eg:
 * 1593986853 -> 07/05/2020 @ 10:07pm (UTC)
 * 1593986853 -> 06/24/2020 @ 8:20am (UTC)
 * @param timestamp Unix timestamp.
 */
export function timestampToPrefix(timestamp: number): number {
  return Number(timestamp.toString().substr(0, 4));
}

// 'v1/1595/1595000036'
export function filePathToTimestamp(path: string): number {
  return Number(path.split('/')[2])
}


/* Not tested heavily */
export async function saveAWSFile(awsPath: string, diskPath: string): Promise<any> {
  // const diskPrefix = "/home/ubuntu/repos/sydney-bus-visualisation/cache/";
  // const diskPrefix = "~/repos/sydney-bus-visualisation/cache/"
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3();
    var params = {
      Bucket: 'sydney-bus-visualisation',
      // Delimiter: '/',
      Key: awsPath
      // Prefix: 'v1/'
    }
    // var params = {
    //   Bucket: "examplebucket",
    //   Key: "HappyFace.jpg"
    // };

    s3.getObject(params, (err, data) => {
      if (err) {
        reject(err)
        return;
      };
      if (data === null) {
        reject("s3.getObject param data is null");
        return;
      }
      if (data === undefined) {
        reject("s3.getObject param data is undefined");
        return;
      }
      if (data.Body === undefined) {
        reject("data.Body is undefined");
        return;
      }

      // if (!fs.existsSync(path)){
      //   fs.mkdirSync(path);
      // }

      // const savePath = `${diskPrefix}${awsPath}`
      // const savePath = `${diskPrefix}${path}`
      const file = data.Body as Buffer;
      // console.log({file});
      fs.writeFile(diskPath, file, "binary", (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
}

export async function readProtbufFromAWS(awsPath: string): Promise<Buffer> {
  // const diskPrefix = "/home/ubuntu/repos/sydney-bus-visualisation/cache/";
  // const diskPrefix = "~/repos/sydney-bus-visualisation/cache/"
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3();
    var params = {
      Bucket: 'sydney-bus-visualisation',
      // Delimiter: '/',
      Key: awsPath
      // Prefix: 'v1/'
    }
    // var params = {
    //   Bucket: "examplebucket",
    //   Key: "HappyFace.jpg"
    // };

    s3.getObject(params, (err, data) => {
      if (err) {
        console.error(`s3 getObject err: ${err}`);
        reject(err)
        return;
      };
      if (data === null) {
        console.error("s3.getObject param data is null");
        reject("s3.getObject param data is null");
        return;
      }
      if (data === undefined) {
        console.error("s3.getObject param data is undefined");
        reject("s3.getObject param data is undefined");
        return;
      }
      if (data.Body === undefined) {
        reject("data.Body is undefined");
        return;
      }

      // const savePath = `${diskPrefix}${awsPath}`
      // const savePath = `${diskPrefix}${path}`
      const file = data.Body as Buffer;
      resolve(file);
    });
  });
}
