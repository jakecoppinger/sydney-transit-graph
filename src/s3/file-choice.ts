import * as request from 'request';
import { timestampToPrefix } from "./s3";
import { getConfig } from '../utils/config';

/**
 * Get up to *numFiles* available files between two times
 * @param startUnixTime
 * @param endUnixTime
 * @param numFiles The maximum number of filenames to return
 * @returns List of unix timestamps correspinding to files
 */

export async function getAvailableTimestamps(
  startUnixTime: number,
  endUnixTime: number,
  max_files_accessed: number
): Promise<number[]> {
  return new Promise((resolve: any, reject: any) => {
    const { timestampServerHostname, isTimestampServerSecure, timestampServerPort } = getConfig();
    const basePath = `${isTimestampServerSecure ? 'https' : 'http'}://${timestampServerHostname}:${timestampServerPort}`;
    const url = `${basePath}/v1/get_timestamps_unix?start_timestamp=${startUnixTime}&end_timestamp=${endUnixTime}&quantity=${max_files_accessed}`
    request.post(url, {
    }, (error, res, body) => {
      if (error) {
        console.error("Error getting timestamps: ", error)
        reject(error);
      }
      if(res === undefined) {
        console.error("Res undef in getAvailableTimestamps");
        reject("no res");
      }
      if (res.statusCode != 200) {
        reject("Status code is not 200");
      }
      const timestampsInBetween = JSON.parse(body);
      resolve(timestampsInBetween);
    });
  });
}

/**
 * Convert list of timestamps to list of filepaths
 * @param timestamps 
*/
export function timestampsToFilepaths(timestamps: number[]): string[] {
  const filepaths = timestamps.map(timestamp => {
    const prefix = timestampToPrefix(timestamp);
    const path = `v1/${prefix}/${timestamp}`;
    return path
  });
  return filepaths;
}

