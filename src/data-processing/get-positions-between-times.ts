
import {
  RawBusUpdateInterface,
  RoutePointInterface,
  BusProgressWaypointInterface
} from '../interfaces/interfaces';

import { getAvailableTimestamps, timestampsToFilepaths } from '../s3/file-choice';
import { readProtbufFromAWS } from '../s3/s3';
import { loadRouteShape } from '../filesystem/read-route-csv';
import { parseProtobuf, validateTypeRawUpdates } from '../filesystem/protobuf-common';
import { rawBusUpdatesToBusProgressDict } from '../data-processing/bus-positions'
import * as fs from 'fs'
const protobuf = require('protocol-buffers')

/**
 * Get list of bus positions with timestamps between the given times
 * @param startTimestamp
 * @param endTimestamp 
 * @param routeId Exact route is specified in routes.json
 * @param shortRouteName The short code identifying the Route to the public. Sourced from the Bus Contracts Management System.
       For example: “10A”
 * @param agencyId The O/SMBSC Contract ID, allocated by TfNSW. For Example: “2447”
 * @param maxFilesAccessed 
 */
export async function getPositionsBetweenTimes(
  startTimestamp: number,
  endTimestamp: number,
  routeId: string,
  shortRouteName: string,
  agencyId: string,
  maxFilesAccessed: number,
): Promise<BusProgressWaypointInterface[]> {
  const getFilepathsAndShapesBeginTime = new Date();

  let timestamps: number[];
  try {
    console.log("About to get available timestamps...");
    timestamps = await getAvailableTimestamps(startTimestamp, endTimestamp, maxFilesAccessed);
  } catch (e) {
    return Promise.reject(`Hitting timestamp server failed with error: ${e}`)
  }
  const filepaths = timestampsToFilepaths(timestamps);
  let routeShape: RoutePointInterface[]
  try {
    routeShape  = await loadRouteShape(routeId);
  } catch(e) {
    return Promise.reject(`Failed to fetch route shape: ${e}`)
  }
  console.log(routeShape)
  console.log("route shape id:")
  console.log({routeId});
  // TODO: Make async and non blocking
  const messages = protobuf(fs.readFileSync('./gtfs-db/gtfs-realtime.proto'))

  const getFilepathsAndShapesDuration = (new Date() as any) - (getFilepathsAndShapesBeginTime as any);

  const getWaypointsBeginTime = new Date();

  let getProtobufTime = 0;
  let parseProtobufTime = 0;
  let validateTypeRawUpdatesTime = 0;
  let rawBusUpdatesToBusProgressDictTime = 0;

  const allPromises = filepaths.map(async filepath => {

    const t1 = new Date();
    const buf: Buffer = await readProtbufFromAWS(filepath);
    getProtobufTime += (new Date() as any) - (t1 as any);

    const t2 = new Date();
    const untypedRawUpdates = parseProtobuf(messages, buf).entity;
    parseProtobufTime += (new Date() as any) - (t2 as any);


    const t3 = new Date();
    const busUpdates: RawBusUpdateInterface[] = validateTypeRawUpdates(untypedRawUpdates);
    validateTypeRawUpdatesTime += (new Date() as any) - (t3 as any);

    const t4 = new Date();
    const progressWaypoints = rawBusUpdatesToBusProgressDict(
      busUpdates,
      routeShape,
      shortRouteName,
      agencyId
    );
    rawBusUpdatesToBusProgressDictTime += (new Date() as any) - (t4 as any);

    return progressWaypoints;
  });
  const createPromisesDuration = (new Date() as any) - (getWaypointsBeginTime as any);
  console.log({ createPromisesDuration });

  const allWaypoints: BusProgressWaypointInterface[][] = await Promise.all(allPromises)
  console.log({ getProtobufTime, parseProtobufTime, validateTypeRawUpdatesTime, rawBusUpdatesToBusProgressDictTime })


  const getWaypointsDuration = (new Date() as any) - (getWaypointsBeginTime as any);
  console.log({ getWaypointsDuration });

  const flattendWaypoints: BusProgressWaypointInterface[] = [].concat(...allWaypoints);

  const sortedWaypoints = flattendWaypoints.sort((a, b) => {
    return a.measurement_timestamp - b.measurement_timestamp;
  });

  const dedupedWaypoints = sortedWaypoints.filter((waypoint, index) => {
    if (index === 0) {
      // Can't be any duplicates if it's the first one!
      return true;
    }
    return waypoint.measurement_timestamp !== sortedWaypoints[index - 1].measurement_timestamp
      && waypoint.trip_id !== sortedWaypoints[index - 1].trip_id;
  });
  console.log("Finished request");
  return dedupedWaypoints;
}