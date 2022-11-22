import * as request from 'request'
import * as fs from 'fs'
import {computeProgress} from '../data-processing/calculate-progress'
import { BusProgressWaypointInterface, 
  RawBusUpdateInterface, RoutePointInterface } from "../interfaces/interfaces";
import interfacesTI from "../interfaces/interfaces-ti";
import {createCheckers} from "ts-interface-checker";
const {RawBusUpdateInterface} = createCheckers(interfacesTI);
// import {MareyDB} from './marey-db-connector'

// /**
//  * Read in a protocol buffer file, and insert the contents into the db
//  * @param filename
//  * @param db
//  * @param protobufSchema Schema for the protocol buffer
//  * @param route_shapes All the route shapes
//  */
// export async function dumpProtobufFileToDB(filename:string, db: MareyDB, protobufSchema:any, 
// 	route_shapes:RouteShapesInterface) {
//     if(!route_shapes) {
//       throw "Empty route shapes";
//     }
// 		const contents = fs.readFileSync(filename)
// 		const untypedRawUpdates = parseProtobuf(protobufSchema, contents).entity
//     const rawUpdates = validateTypeRawUpdates(untypedRawUpdates);
// 		const progressWaypoints = rawUpdates
//        // Only buses we have routes for!
//       .filter(update => getBusNumber(update) in route_shapes)
// 			// Make sure vehicle is defined
// 			.filter(update => update.vehicle)
// 			// Make sure position is defined
//       .filter(update => update.vehicle.position)
// 			.map(update => {
//         const bus = getBusNumber(update);
//         const route_points: RoutePointInterface[] = route_shapes[bus];
//         if(route_points.length == 0) {
//           throw "Route points has zero length";
//         }
//         return busUpdateToProgressWaypoint(update,route_points);
//       })

// 		console.log("running batch insert..")
// 		await db.batchInsertProgressWaypoints(progressWaypoints);
// }

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
 * Converts update from raw obj from protobuf to progress waypoint interface
 * with progress
 * @param update Raw obj blob straight from the protobuf
 * @param route_points The point specifying the route of the vehicle
 */
export function busUpdateToProgressWaypoint(update: RawBusUpdateInterface, 
  route_points: RoutePointInterface[]): BusProgressWaypointInterface {

  const progress = computeProgress(
    [
      update.vehicle.position.latitude,
      update.vehicle.position.longitude
    ], route_points)
  return {
    trip_id: update.id, // Fix this if there isn't more than one bus in a 'line'
    route: getBusNumber(update),
    measurement_timestamp: update.vehicle.timestamp,
    trip_direction:update.vehicle.trip.direction_id,
    progress,
    occupancy_status: update.vehicle.occupancy_status,
    latitude: update.vehicle.position.latitude,
    longitude: update.vehicle.position.longitude,
  }
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
