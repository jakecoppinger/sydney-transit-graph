import { BusProgressWaypointInterface, RoutePointInterface } from "../interfaces/interfaces";

const twoPointDistance = (a:number[], b:number[]) => Math.sqrt(((b[1] - a[1]) ** 2) +
    ((b[0] - a[0]) ** 2))


type WaypointWithDist = RoutePointInterface & {
  distance: number;
};

/**
 * Compute the progress of our position over a route made up of waypoints
 * @param position Array, lat then lon
 * @param waypoints 
 */
export function computeProgress(position: number[], 
  waypoints:RoutePointInterface[]) {

  const routeLength = waypoints.reduce((distTravelledMax, curr) =>
    curr.shape_dist_traveled > distTravelledMax
    ? curr.shape_dist_traveled
    : distTravelledMax
  , 0)

  const sortedWaypoints = waypoints;
  sortedWaypoints.sort(point => point.shape_pt_sequence)

  // Calculate distance to each point
  const updatedWaypoints: WaypointWithDist[] = waypoints
    .map((waypoint) =>
     Object.assign({}, waypoint,
       {distance: twoPointDistance(position,
        [waypoint.shape_pt_lat, waypoint.shape_pt_lon]
      )})
    )

  // Find closest and second closest waypoint
  let closestWaypoint: WaypointWithDist | undefined = undefined;
  let nextClosestWaypoint: WaypointWithDist | undefined = undefined;

  updatedWaypoints.forEach(waypoint => {
    if(closestWaypoint === undefined) {
      closestWaypoint = waypoint;
      return;
    }
    if(waypoint.distance <= closestWaypoint.distance) {
      nextClosestWaypoint = closestWaypoint
      closestWaypoint = waypoint;
    }
  });

  // If there are 0 or 1 points, report 0 progress
  if(closestWaypoint === undefined || nextClosestWaypoint === undefined) {
    return 0;
  }

  const distToClosestWaypoint = twoPointDistance(position, 
    [closestWaypoint.shape_pt_lat, closestWaypoint.shape_pt_lon]);
  const distToNextClosestWaypoint = twoPointDistance(position, 
    [nextClosestWaypoint.shape_pt_lat, nextClosestWaypoint.shape_pt_lon]);
  
  /** 0 means we're at closest waypoint, 1 means we're at next closest **/
  const ratioBetweenNearestWaypoints = 
    distToClosestWaypoint / (distToClosestWaypoint + distToNextClosestWaypoint)
    
  const closestWaypointProgress = closestWaypoint.shape_dist_traveled / routeLength;
  const nextClosestWaypointProgress = nextClosestWaypoint.shape_dist_traveled / routeLength;
  
  // Remember - ratio being zero means we're at the closest waypoint :)
  const percentage = (ratioBetweenNearestWaypoints * nextClosestWaypointProgress) + ((1-ratioBetweenNearestWaypoints) * closestWaypointProgress)

  if (percentage > 1) {
    console.warn(`Warning: trip percentage greater than 1, %: ${percentage}`)
    console.warn(`  position: ${JSON.stringify(position, null, 2)}`)
    console.log(`  closestWaypoint.shape_dist_travelled: ${closestWaypoint.shape_dist_traveled}, \
    maxDist: ${routeLength}`);
    // throw Error(`Percentage greater than 1.\nposition: ${JSON.stringify(position, null, 2)}`)
    return 1
  }
  return percentage
}
