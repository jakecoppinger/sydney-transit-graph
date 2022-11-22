var assert = require('assert');
import { computeProgress } from '../src/data-processing/calculate-progress';
import { readRouteCSV } from "../src/filesystem/read-route-csv";
import { RoutePointInterface } from '../src/interfaces/interfaces';

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // @ts-ignore
  console.log(reason.stack)
  // application specific logging, throwing an error, or other logic here
});

const csvPath = './test/data/csvs/';

describe('#computeProgress()', async function () {
  it('should return 0% (0) for point same as start point', async function () {
    const route_points = await readRouteCSV(`${csvPath}372.csv`);
    const position: number[] = [-33.8838698694059, 151.203602808753];
    const result = computeProgress(position, route_points);
    assert(result == 0);
  });
  it('should return 100% (1) for point same as end point', async function () {
    const route_points = await readRouteCSV(`${csvPath}372.csv`);
    const position: number[] = [-33.919060995384, 151.254711362682];
    const result = computeProgress(position, route_points);
    assert(result == 1);
  });
  it('should return exact shape_dist_traveled for point on route waypoint', async function () {
    const route_points = await readRouteCSV(`${csvPath}372.csv`);
    // First waypoint
    // 31-372-sj2-1.1.H,-33.8837327366705,151.203660888247,2,16.1554944214035
    // Last route length is 8835.20655463126
    const position: number[] = [-33.8837327366705, 151.203660888247];
    const result = computeProgress(position, route_points);
    assert(result == 16.1554944214035 / 8835.20655463126);
  });

  it('should return 50% for point half way along', async function () {
    /*
      shape_id: string,
      shape_pt_lat: number,
      shape_pt_lon: number,
      shape_pt_sequence: number,
      shape_dist_traveled: number
    */
    const shape_id = 'a shape id';
    const route_points: RoutePointInterface[] = [
      {
        shape_id,
        shape_pt_lat: 0,
        shape_pt_lon: 0,
        shape_dist_traveled: 0,
        shape_pt_sequence: 1
      },
      {
        shape_id,
        shape_pt_lat: 0,
        shape_pt_lon: 10,
        shape_dist_traveled: 10,
        shape_pt_sequence: 2
      }
    ];
    const position: number[] = [0, 5];
    const result = computeProgress(position, route_points);
    console.log({ result });
    assert(result == 0.5);
  });

it('should return 50% for point half way along but off to the side', async function () {
    /*
      shape_id: string,
      shape_pt_lat: number,
      shape_pt_lon: number,
      shape_pt_sequence: number,
      shape_dist_traveled: number
    */
    const shape_id = 'a shape id';
    const route_points: RoutePointInterface[] = [
      {
        shape_id,
        shape_pt_lat: 0,
        shape_pt_lon: 0,
        shape_dist_traveled: 0,
        shape_pt_sequence: 1
      },
      {
        shape_id,
        shape_pt_lat: 0,
        shape_pt_lon: 10,
        shape_dist_traveled: 10,
        shape_pt_sequence: 2
      }
    ];
    const position: number[] = [5, 5];
    const result = computeProgress(position, route_points);
    console.log({ result });
    assert(result == 0.5);
  });

  // TODO: Check behaviour when in between waypoints!
});