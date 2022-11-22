// Functions to take the progress from the ui and the bus traces,
// and interpolate the positions to display traces on the map.

import * as moment from "moment";
import {
  FrontendBusProgressWaypointInterface,
  BusProgressCoordinate,
} from "../../src/interfaces/interfaces";
import { clamp } from "./utils/utils";

/**
 * Create a new waypoint, interpolated between waypoints a and b. Actual progress is a value between
 * 0 and 1, and a and b both contain progresses between 0 and 1.
 * @param actualTimestamp Human readable ISO8601 Timestamp
 * @param a Waypoint with smaller progress
 * @param b Waypoint with larger progress
 */
export function interpolateWaypoints(
  actualTimestamp: string,
  a: FrontendBusProgressWaypointInterface,
  b: FrontendBusProgressWaypointInterface
): BusProgressCoordinate {
  // |--                       | = 0% = 0
  // |                       ==| = 100% = 1.0
  const actualUnix = moment(actualTimestamp).unix();
  const aUnix = moment(a.human_timestamp).unix();
  const bUnix = moment(b.human_timestamp).unix();

  if (bUnix < aUnix) {
    throw new Error(
      `points are not time ordered (a timestamp is ${a.human_timestamp}, b timestamp is ${b.human_timestamp}`
    );
  }

  const durationBetweenPoints = bUnix - aUnix;
  const clampedActualTS = clamp(actualUnix, aUnix, bUnix);
  const ratio =
    durationBetweenPoints === 0
      ? 0
      : (clampedActualTS - aUnix) / durationBetweenPoints;

  const inverse = 1 - ratio;
  return {
    lat: a.latitude * inverse + b.latitude * ratio,
    lon: a.longitude * inverse + b.longitude * ratio,
    occupancy_status: a.occupancy_status,
    tripId: a.trip_id // ASSUMPTION: Same for both points :D
  };
}

// TODO: This is currently n^2, we can make it n when need be.
export function getCoordinatesForTimestamp(
  timestamp: string,
  waypoints: FrontendBusProgressWaypointInterface[]
): BusProgressCoordinate[] {
  const allTripIds = waypoints.map((waypoint) => waypoint.trip_id);
  const uniqueTripIds = allTripIds.filter(
    (item, index) => allTripIds.indexOf(item) === index
  );

  /*
  for each trip id:
  - find prevPoint: find waypoint with given trip ID, with maximum progress value, smaller OR equal to target progress
  - find nextPoint: find waypoint with given trip ID, with minimum progress value, larger than target prorgess
  - calculate new interpolated BusProgressCoordinate between these two values
    - if previous waypoint not found, prevPoint is nextPoint
    - if next waypoint not found, nextPoint is prevPoint
    - if neither is found, don't return that point

  find previous waypoint
  find next waypoint
  */

  let outputWaypoints: BusProgressCoordinate[] = [];
  const unixWaypoints = waypoints.map((point) => ({
    ...point,
    unix_timestamp: moment(point.human_timestamp).unix(),
  }));
  const unixTimestamp = moment(timestamp).unix();

  for (const tripId of uniqueTripIds) {
    let prevPointIndex: number | undefined = undefined;
    let prevPointUnixTS: number | undefined = undefined;
    let nextPointIndex: number | undefined = undefined;
    let nextPointUnixTS: number | undefined = undefined;

    for (let i = 0; i < unixWaypoints.length; i++) {
      const waypoint = unixWaypoints[i];
      if (
        waypoint.trip_id == tripId &&
        waypoint.unix_timestamp <= unixTimestamp &&
        (prevPointUnixTS === undefined ||
          waypoint.unix_timestamp > prevPointUnixTS)
      ) {
        prevPointIndex = i;
        prevPointUnixTS = waypoint.unix_timestamp;
      }

      if (
        waypoint.trip_id == tripId &&
        waypoint.unix_timestamp > unixTimestamp &&
        (nextPointUnixTS === undefined ||
          waypoint.unix_timestamp < nextPointUnixTS)
      ) {
        nextPointIndex = i;
        nextPointUnixTS = waypoint.unix_timestamp;
      }
    }
    if (prevPointIndex === undefined && nextPointIndex === undefined) {
      continue;
    }

    if (prevPointIndex === undefined) {
      // We know they're not both undefined, so the other must be a number
      prevPointIndex = nextPointIndex as number;
      prevPointUnixTS = nextPointUnixTS;
    }
    if (nextPointIndex === undefined) {
      // We know they're not both undefined, so the other must be a number
      nextPointIndex = prevPointIndex as number;
      nextPointUnixTS = prevPointUnixTS;
    }

    // Handy debug!
    // console.log(`prev ts: ${unixWaypoints[prevPointIndex].human_timestamp}, next: ${unixWaypoints[nextPointIndex].human_timestamp}`);

    const interpolatedWaypoint = interpolateWaypoints(
      timestamp,
      unixWaypoints[prevPointIndex],
      unixWaypoints[nextPointIndex]
    );
    outputWaypoints.push(interpolatedWaypoint);
  }
  return outputWaypoints;
}
