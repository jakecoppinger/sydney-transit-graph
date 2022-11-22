var assert = require('assert');
import { quantiseBusProgressWaypoints } from "../src/business-layer";
import { BusProgressWaypointInterface } from "../src/interfaces";
import {isEquivalent, isObjArraysEquivalent} from "../src/test-helpers";

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // @ts-ignore
  console.log(reason.stack)
  // application specific logging, throwing an error, or other logic here
});


describe('#quantiseBusProgressWaypoints()', async function() {
    it('should return no points if no points given', async function() {
      const quantiseVal = 0.1
      const res = quantiseBusProgressWaypoints([],quantiseVal)
      // console.log({res})
      assert(res.length == 0);
    });
    it('should only return first point if second isnt past threshold' , async function() {
      const waypoints:BusProgressWaypointInterface[] = [
        {
            "trip_id":"A",
            "route":"1",
            "trip_direction":0,
            "measurement_timestamp": 0,
            "progress": 0.05,
            "occupancy_status": -1,
            "latitude": -1,
            "longitude": -1,
        },
        {
            "trip_id":"A",
            "route":"1",
            "trip_direction":0,
            "measurement_timestamp": 0,
            "progress": 0,
            "occupancy_status": -1,
            "latitude": -1,
            "longitude": -1,
        }
      ]
      const expectedOutputWaypoints: BusProgressWaypointInterface[] = [
        {
            "trip_id":"A",
            "route":"1",
            "trip_direction":0,
            "measurement_timestamp": 0,
            "progress": 0.05,
            "occupancy_status": -1,
            "latitude": -1,
            "longitude": -1,
        }
      ]
      const quantiseVal = 0.1
      const res = quantiseBusProgressWaypoints(waypoints,quantiseVal)
      assert(isObjArraysEquivalent(res, expectedOutputWaypoints));
    });
    it('should return both points always if different trip IDs' , async function() {
      const waypoints:BusProgressWaypointInterface[] = [
        {
            "trip_id":"A",
            "route":"1",
            "trip_direction":0,
            "measurement_timestamp": 0,
            "progress": 0.05,
            "occupancy_status": -1,
            "latitude": -1,
            "longitude": -1,
        },
        {
            "trip_id":"B",
            "route":"1",
            "trip_direction":0,
            "measurement_timestamp": 0,
            "progress": 0,
            "occupancy_status": -1,
            "latitude": -1,
            "longitude": -1,
        }
      ]
      const quantiseVal = 0.1
      const res = quantiseBusProgressWaypoints(waypoints,quantiseVal)
      assert(isObjArraysEquivalent(res, waypoints));
    });
    it('should return both points if prev IS at threshold' , async function() {
      const waypoints:BusProgressWaypointInterface[] = [
        {
            "trip_id":"A",
            "route":"1",
            "trip_direction":0,
            "measurement_timestamp": 0,
            "progress": 0.1,
            "occupancy_status": -1,
            "latitude": -1,
            "longitude": -1,
        },
        {
            "trip_id":"B",
            "route":"1",
            "trip_direction":0,
            "measurement_timestamp": 0,
            "progress": 0,
            "occupancy_status": -1,
            "latitude": -1,
            "longitude": -1,
        }
      ]
      const quantiseVal = 0.1
      const res = quantiseBusProgressWaypoints(waypoints,quantiseVal)
      assert(isObjArraysEquivalent(res, waypoints));
    });
    it('should return both points if prev IS past threshold' , async function() {
      const waypoints:BusProgressWaypointInterface[] = [
        {
            "trip_id":"A",
            "route":"1",
            "trip_direction":0,
            "measurement_timestamp": 0,
            "progress": 0.15,
            "occupancy_status": -1,
            "latitude": -1,
            "longitude": -1,
        },
        {
            "trip_id":"B",
            "route":"1",
            "trip_direction":0,
            "measurement_timestamp": 0,
            "progress": 0,
            "occupancy_status": -1,
            "latitude": -1,
            "longitude": -1,
        }
      ]
      const quantiseVal = 0.1
      const res = quantiseBusProgressWaypoints(waypoints,quantiseVal)
      assert(isObjArraysEquivalent(res, waypoints));
    });
});
