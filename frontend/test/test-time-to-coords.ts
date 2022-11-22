import {
  BusProgressCoordinate,
  FrontendBusProgressWaypointInterface,
} from "../../src/interfaces/interfaces";
import {
  getCoordinatesForTimestamp,
  interpolateWaypoints,
} from "../src/time-to-coords";
var assert = require("assert");

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
  // @ts-ignore
  console.log(reason.stack);
  // application specific logging, throwing an error, or other logic here
});

// Unskip after fixing interpolateWaypoints
describe("#getCoordinatesForTimestamp()", async function () {
  it("returns empty coordinate list when no traces given", () => {
    const actual = getCoordinatesForTimestamp("2020-11-12T12:30:00+11:00", []);
    const expected = [];
    assert(JSON.stringify(actual) === JSON.stringify(expected));
  });

  it("returns the exact coordinate when matching progress waypoint found", () => {
    const waypoints: FrontendBusProgressWaypointInterface[] = [
      {
        trip_id: "trip_id",
        route: "route",
        trip_direction: 1,
        human_timestamp: "2020-11-12T12:30:00+11:00",
        progress: 0.5,
        occupancy_status: 0,
        latitude: 123,
        longitude: 456,
      },
    ];

    const actual = getCoordinatesForTimestamp(
      "2020-11-12T12:30:00+11:00",
      waypoints
    );
    const expected: BusProgressCoordinate[] = [
      {
        lat: 123,
        lon: 456,
        occupancy_status: 0,
        tripId: "trip_id"
      },
    ];
    console.log({actual, expected});
    assert(JSON.stringify(actual) === JSON.stringify(expected));
  });

  it("returns interpolated coordinate when in between two waypoints", () => {
    const waypoints: FrontendBusProgressWaypointInterface[] = [
      {
        trip_id: "trip_id",
        route: "route",
        trip_direction: 1,
        human_timestamp: "2020-11-12T12:30:00+11:00",
        progress: 0.4,
        occupancy_status: 0,
        latitude: 1,
        longitude: 4,
      },
      {
        trip_id: "trip_id",
        route: "route",
        trip_direction: 1,
        human_timestamp: "2020-11-12T12:40:00+11:00",
        progress: 0.6,
        occupancy_status: 0,
        latitude: 2,
        longitude: 5,
      },
    ];

    const actual = getCoordinatesForTimestamp(
      "2020-11-12T12:35:00+11:00",
      waypoints
    );
    const expected: BusProgressCoordinate[] = [
      {
        lat: 1.5,
        lon: 4.5,
        occupancy_status: 0,
        tripId: "trip_id"
      },
    ];
    assert(JSON.stringify(actual) === JSON.stringify(expected));
  });
  it("returns interpolated coordinates for multiple trip ids when in between two waypoints", () => {
    const waypoints: FrontendBusProgressWaypointInterface[] = [
      {
        trip_id: "trip_id1",
        route: "route",
        trip_direction: 1,
        human_timestamp: "2020-11-12T12:30:00+11:00",
        progress: 0.4,
        occupancy_status: 0,
        latitude: 1,
        longitude: 4,
      },
      {
        trip_id: "trip_id1",
        route: "route",
        trip_direction: 1,
        human_timestamp: "2020-11-12T12:40:00+11:00",
        progress: 0.6,
        occupancy_status: 0,
        latitude: 2,
        longitude: 5,
      },
      {
        trip_id: "trip_id2",
        route: "route",
        trip_direction: 1,
        human_timestamp: "2020-11-12T12:30:00+11:00",
        progress: 0.4,
        occupancy_status: 3,
        latitude: 1,
        longitude: 4,
      },
      {
        trip_id: "trip_id2",
        route: "route",
        trip_direction: 1,
        human_timestamp: "2020-11-12T12:40:00+11:00",
        progress: 0.6,
        occupancy_status: 3,
        latitude: 2,
        longitude: 5,
      },
    ];
    const actual = getCoordinatesForTimestamp(
      "2020-11-12T12:35:00+11:00",
      waypoints
    );
    const expected: BusProgressCoordinate[] = [
      {
        lat: 1.5,
        lon: 4.5,
        occupancy_status: 0,
        tripId: "trip_id1"
      },
      {
        lat: 1.5,
        lon: 4.5,
        occupancy_status: 3,
        tripId: "trip_id2"
      },
    ];
    assert(JSON.stringify(actual) === JSON.stringify(expected));
  });
});

describe("#interpolateWaypoint()", async function () {
  it("return exact same timestamp when a and b have same timestamp ", () => {
    const a: FrontendBusProgressWaypointInterface = {
      trip_id: "trip_id",
      route: "route",
      trip_direction: 1,
      human_timestamp: "2020-11-12T12:39:06+11:00",
      progress: 0.5,
      occupancy_status: 0,
      latitude: 10,
      longitude: 100,
    };

    const b: FrontendBusProgressWaypointInterface = {
      trip_id: "trip_id",
      route: "route",
      trip_direction: 1,
      human_timestamp: "2020-11-12T12:39:06+11:00",
      progress: 0.5,
      occupancy_status: 1,
      latitude: 20,
      longitude: 200,
    };
    const actualTimestamp = "2020-11-12T12:39:06+11:00";
    const actual = interpolateWaypoints(actualTimestamp, a, b);
    const expected: BusProgressCoordinate = {
      lat: 10,
      lon: 100,
      occupancy_status: 0,
      tripId: "trip_id"
    };
    assert(JSON.stringify(actual) === JSON.stringify(expected));
  });

  it("return first point coords when timestamp at first point", () => {
    const a: FrontendBusProgressWaypointInterface = {
      trip_id: "trip_id",
      route: "route",
      trip_direction: 1,
      human_timestamp: "2020-11-12T12:30:00+11:00",
      progress: 0.4,
      occupancy_status: 0,
      latitude: 10,
      longitude: 100,
    };

    const b: FrontendBusProgressWaypointInterface = {
      trip_id: "trip_id",
      route: "route",
      trip_direction: 1,
      human_timestamp: "2020-11-12T12:40:00+11:00",
      progress: 0.6,
      occupancy_status: 1,
      latitude: 20,
      longitude: 200,
    };
    const actualTime = "2020-11-12T12:30:00+11:00";
    const actual = interpolateWaypoints(actualTime, a, b);
    const expected: BusProgressCoordinate = {
      lat: 10,
      lon: 100,
      occupancy_status: 0,
      tripId: "trip_id"
    };
    assert(JSON.stringify(actual) === JSON.stringify(expected));
  });
  it("return last point coords when time at last point", () => {
    const a: FrontendBusProgressWaypointInterface = {
      trip_id: "trip_id",
      route: "route",
      trip_direction: 1,
      human_timestamp: "2020-11-12T12:30:00+11:00",
      progress: 0.4,
      occupancy_status: 0,
      latitude: 10,
      longitude: 100,
    };

    const b: FrontendBusProgressWaypointInterface = {
      trip_id: "trip_id",
      route: "route",
      trip_direction: 1,
      human_timestamp: "2020-11-12T12:40:00+11:00",
      progress: 0.6,
      occupancy_status: 1,
      latitude: 20,
      longitude: 200,
    };
    const actualTime = "2020-11-12T12:40:00+11:00";
    const actual = interpolateWaypoints(actualTime, a, b);
    const expected: BusProgressCoordinate = {
      lat: 20,
      lon: 200,
      occupancy_status: 0,
      tripId: "trip_id"
    };
    assert(JSON.stringify(actual) === JSON.stringify(expected));
  });

  it("return averaged coords when progress in middle of points", () => {
    const a: FrontendBusProgressWaypointInterface = {
      trip_id: "trip_id",
      route: "route",
      trip_direction: 1,
      human_timestamp: "2020-11-12T12:30:00+11:00",
      progress: 0.4,
      occupancy_status: 0,
      latitude: 10,
      longitude: 100,
    };

    const b: FrontendBusProgressWaypointInterface = {
      trip_id: "trip_id",
      route: "route",
      trip_direction: 1,
      human_timestamp: "2020-11-12T12:40:00+11:00",
      progress: 0.6,
      occupancy_status: 1,
      latitude: 20,
      longitude: 200,
    };
    const actualTime = "2020-11-12T12:35:00+11:00";
    const actual = interpolateWaypoints(actualTime, a, b);
    const expected: BusProgressCoordinate = {
      lat: 15,
      lon: 150,
      occupancy_status: 0,
      tripId: "trip_id"
    };
    assert(JSON.stringify(actual) === JSON.stringify(expected));
  });
  it("return second coord when progress is outside range and larger than the second point", () => {
    const a: FrontendBusProgressWaypointInterface = {
      trip_id: "trip_id",
      route: "route",
      trip_direction: 1,
      human_timestamp: "2020-11-12T12:30:00+11:00",
      progress: 0.4,
      occupancy_status: 0,
      latitude: 10,
      longitude: 100,
    };

    const b: FrontendBusProgressWaypointInterface = {
      trip_id: "trip_id",
      route: "route",
      trip_direction: 1,
      human_timestamp: "2020-11-12T12:40:00+11:00",
      progress: 0.6,
      occupancy_status: 1,
      latitude: 20,
      longitude: 200,
    };
    const actualTime = "2020-11-12T12:45:00+11:00";
    const actual = interpolateWaypoints(actualTime, a, b);
    const expected: BusProgressCoordinate = {
      lat: 20,
      lon: 200,
      occupancy_status: 0,
      tripId: "trip_id"
    };
    assert(JSON.stringify(actual) === JSON.stringify(expected));
  });
});
