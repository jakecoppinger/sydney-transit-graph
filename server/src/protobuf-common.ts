import * as request from 'request'
import * as fs from 'fs'
import { RawBusUpdateInterface } from "./interfaces";
import interfacesTI from "./interfaces-ti";
import {createCheckers} from "ts-interface-checker";
const {RawBusUpdateInterface} = createCheckers(interfacesTI);
import {execSync} from 'child_process';

export function runShellCommand(command: string):string {
  const output = execSync(command, { encoding: 'utf-8' });  // the default is 'buffer'
  return output;
}


// Parse protobuf binary to JSON object
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
      }
      if (!(response && response.statusCode === 200)) {
        reject(`Response error:response code ${response.statusCode}`)
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

export function getBusNumber(update: RawBusUpdateInterface): string {
  return update.vehicle.trip.route_id.split('_')[1]
}
