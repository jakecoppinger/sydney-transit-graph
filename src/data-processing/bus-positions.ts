import { RawBusUpdateInterface, BusProgressWaypointInterface, RoutePointInterface } from "../interfaces/interfaces";
import { busUpdateToProgressWaypoint } from '../filesystem/protobuf-tools';

/*
Generate the route_id that is in .vehicle.trip.route_id in bus updates
*/
function generateTripRouteID(shortRouteName: string, agencyId: string): string {
  // if(agencyId === "2441") {
  //   return `_${shortRouteName}`
  // }
  return `${agencyId}_${shortRouteName}`
}

/**
 * Convert a list of raw bus updates into a clean dictionary with the bus progress
 * % and time (among other things).
 * @param busUpdates List up raw bus updates as JS objects
 * @param routeShapes Dictionary of route names to route shapes
 * @param shortRouteName The short code identifying the Route to the public. Sourced from the Bus Contracts Management System.
       For example: “10A”
 * @param agencyId The O/SMBSC Contract ID, allocated by TfNSW. For Example: “2447”
 */
export function rawBusUpdatesToBusProgressDict(
  busUpdates: RawBusUpdateInterface[],
  routePoints: RoutePointInterface[],
  shortRouteName: string,
  agencyId: string
): BusProgressWaypointInterface[] {
  const rawUpdates = busUpdates;
  /** The weird formatted trip route id in the bus updates */
  const tripRouteId = generateTripRouteID(shortRouteName, agencyId);
  const progressWaypoints = rawUpdates
    // Only buses we have routes for!
    .filter(update => update.vehicle.trip.route_id === tripRouteId)
    // Make sure vehicle is defined
    .filter(update => update.vehicle)
    // Make sure position is defined
    .filter(update => update.vehicle.position)
    .map(update => busUpdateToProgressWaypoint(update, routePoints))
  return progressWaypoints;
}