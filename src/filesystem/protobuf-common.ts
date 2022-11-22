import * as request from 'request'
import * as fs from 'fs'
import { RawBusUpdateInterface } from "../interfaces/interfaces";
import interfacesTI from "../interfaces/interfaces-ti";
import {createCheckers} from "ts-interface-checker";
const {RawBusUpdateInterface} = createCheckers(interfacesTI);
import {execSync} from 'child_process';

export function runShellCommand(command: string):string {
  const output = execSync(command, { encoding: 'utf-8' });  // the default is 'buffer'
  return output;
}

/**
 * Parse protobuf binary to JSON object
 * @param protobufSchema Schedule to use
 * @param buf Buffer
 */
export function parseProtobuf(protobufSchema:any, buf: Buffer|string): any {
  const obj = protobufSchema.FeedMessage.decode(buf)
  return obj
}

export function validateTypeRawUpdates(rawUpdates:any[]):RawBusUpdateInterface[] {
    return rawUpdates.map((untyped_update:any) => {
          RawBusUpdateInterface.check(untyped_update)
          return untyped_update;
        })
}

// Get timestamp from the JSON object
export function parseObjTimestamp(obj:any):number {
  return parseInt(obj.header.timestamp);
}

/**
 * Save protocol buffer to the chosen file
 * @param filename
 * @param buf Protocol buffer
 */
export function saveProtobuf(filename:string, buf: string) {
    const fileDescriptor:any = fs.openSync(filename, 'w')
    fs.writeSync(fileDescriptor, buf)
    fs.closeSync(fileDescriptor)
}

/**
 * Get the latest protocol buffer of all buses in Sydney.
 * @returns String of protobuf of all buses in Sydney
*/
export async function makeProtobufRequest(): Promise<string> {
  return new Promise((resolve, reject) => {
    const result = request({
      url: 'https://api.transport.nsw.gov.au/v1/gtfs/vehiclepos/buses',
      //url: 'https://api.transport.nsw.gov.au/v1/gtfs/vehiclepos/sydneytrains',
      headers: {
        'Authorization': 'apikey e9JrpwDGvoJ9yj76coHULjBfc4eav8gSB2kS'
      },
      encoding: null
    }, function (error, response, body) {
      if (error) {
        reject(error);
        return;
      }
      if(response === undefined || response === null) {
        reject('response is undefined or null');
        return;
      }
      if (response?.statusCode !== 200) {
        reject(`Response error: response code ${response.statusCode}`)
        return;
      }
      resolve(body);
    })
  });
}


/**
 * Convert trip id to busroute number
 * @param id trip id
 */
export function idToBusCode(id: string): string {
  return id.split('_')[1]
}

/**
 * Get short bus number from update, eg. 370
 * @param update 
 */
export function getBusNumber(update: RawBusUpdateInterface): string {
  return update.vehicle.trip.route_id.split('_')[1]
}

/**
 * Get route id (ie. long number) from update, eg. 55-370-sj2-1
 * @param update 
 */
export function getRouteId(update: RawBusUpdateInterface): string {
  return update.vehicle.trip.route_id
}
