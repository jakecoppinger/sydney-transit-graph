import { RoutePointInterface, RawBusUpdateInterface, RouteShapesInterface, BusProgressWaypointInterface } from "../src/interfaces/interfaces";
import { rawBusUpdatesToBusProgressDict } from "../src/data-processing/bus-positions";

var assert = require('assert');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // @ts-ignore
  console.log(reason.stack)
  // application specific logging, throwing an error, or other logic here
});

describe('#rawBusUpdateToBusProgressDict()', async function () {
  const stateTransitAgencyId = "2441"
  const shape_id = 'someid';
  const shape_pt_lat = 0;
  const route_id = "2441_exampleRoute";
  const routePoints: RoutePointInterface[] = [
      {
        shape_id,
        shape_pt_lat,
        shape_pt_lon: 0,
        shape_pt_sequence: 1,
        shape_dist_traveled: 0,
      },
      {
        shape_id,
        shape_pt_lat,
        shape_pt_lon: 1,
        shape_pt_sequence: 2,
        shape_dist_traveled: 2,
      },
      {
        shape_id,
        shape_pt_lat,
        shape_pt_lon: 2,
        shape_pt_sequence: 3,
        shape_dist_traveled: 4,
      }
    ];
  it('should process single rawBusUpdate from protobuf to a dictionary that can be graphed', async function () {
    const TRIP_DIRECTION = 1234;
    const busUpdates: RawBusUpdateInterface[] =
      [{
        id: '38743___exampleRoute_1',
        is_deleted: false,
        trip_update: null,
        vehicle:
        {
          trip:
          {
            trip_id: 'exampleTripId',
            route_id,
            direction_id: TRIP_DIRECTION,
            start_time: '16:27:29',
            start_date: '20200723',
            schedule_relationship: 2
          },
          vehicle: { id: '38743___exampleRoute_1', label: '', license_plate: '' },
          position:
          {
            latitude: 0,
            longitude: 1,
            bearing: 99,
            odometer: 0,
            speed: 12.100000381469727
          },
          current_stop_sequence: 0,
          stop_id: '',
          current_status: 2,
          timestamp: 123456789,
          // timestamp: 1595486024,
          congestion_level: 0,
          occupancy_status: 1
        },
        alert: null
      }];

    const actualOutput: BusProgressWaypointInterface[] = rawBusUpdatesToBusProgressDict(
      busUpdates,
      routePoints,
      'exampleRoute',
      stateTransitAgencyId
    );

    const expectedOutput: BusProgressWaypointInterface[] = [{
      trip_id: '38743___exampleRoute_1',
      route: 'exampleRoute',
      measurement_timestamp: 123456789, //1514354747,
      trip_direction: TRIP_DIRECTION,
      progress: 0.5, // 50%, as we're matching the second point
      occupancy_status: 1, //2
      latitude: 0, //-33.8858528137207,
      longitude: 1, //151.203125,
    }
    ];
    assert(JSON.stringify(actualOutput) === JSON.stringify(expectedOutput));
  });

  it('should return no data when processing empty rawBusUpdates', async function () {
    const busUpdates: RawBusUpdateInterface[] = [];
    const routes: string[] = ['notExampleRoute'];
    const actualOutput: BusProgressWaypointInterface[] = rawBusUpdatesToBusProgressDict(
      busUpdates,
      routePoints,
      'exampleRoute',
      stateTransitAgencyId
    );
    const expectedOutput: BusProgressWaypointInterface[] = [];
    assert(actualOutput.toString() === expectedOutput.toString());
  });

  it('should return no data when processing empty rawBusUpdates and routes', async function () {
    const busUpdates: RawBusUpdateInterface[] = [];
    const actualOutput: BusProgressWaypointInterface[] = rawBusUpdatesToBusProgressDict(
      busUpdates,
      routePoints,
      'exampleRoute',
      stateTransitAgencyId
    );
    const expectedOutput: BusProgressWaypointInterface[] = [];
    assert(actualOutput.toString() === expectedOutput.toString());
  });

  it(`should not crash when processing single bus update that doesn't match route`, async function () {
    const TRIP_DIRECTION = 1234;
    const busUpdates: RawBusUpdateInterface[] =
      [{
        id: '38743___exampleRoute_1',
        is_deleted: false,
        trip_update: null,
        vehicle:
        {
          trip:
          {
            trip_id: 'exampleTripId',
            route_id: '_exampleRoute',
            direction_id: TRIP_DIRECTION,
            start_time: '16:27:29',
            start_date: '20200723',
            schedule_relationship: 2
          },
          vehicle: { id: '38743___exampleRoute_1', label: '', license_plate: '' },
          position:
          {
            latitude: 0,
            longitude: 1,
            bearing: 99,
            odometer: 0,
            speed: 12.100000381469727
          },
          current_stop_sequence: 0,
          stop_id: '',
          current_status: 2,
          timestamp: 123456789,
          // timestamp: 1595486024,
          congestion_level: 0,
          occupancy_status: 1
        },
        alert: null
      }];

    const actualOutput: BusProgressWaypointInterface[] = rawBusUpdatesToBusProgressDict(
      busUpdates,
      routePoints,
      'notExampleRoute',
      stateTransitAgencyId
    );

    const expectedOutput: BusProgressWaypointInterface[] = [];
    assert(actualOutput.toString() === expectedOutput.toString());
  });
});