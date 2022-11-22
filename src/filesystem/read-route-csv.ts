import { RouteCSVInterface, RouteInfo, RoutePointInterface }
  from "../interfaces/interfaces";
import * as request from 'request'
import * as csv from 'fast-csv';
import * as fs from 'fs'

function convertRawShapeWaypoint(input: RouteCSVInterface):RoutePointInterface {
  return {
    shape_id: input.shape_id,
    shape_pt_lat: parseFloat(input.shape_pt_lat),
    shape_pt_lon: parseFloat(input.shape_pt_lon),
    shape_dist_traveled: parseFloat(input.shape_dist_traveled),
    shape_pt_sequence: parseInt(input.shape_pt_sequence)
  }
}

/**
 * Fetch all the routes from S3. This includes the short numbers, agency info and route names.
 */
export async function getRoutes(): Promise<RouteInfo[]> {
  return new Promise((resolve, reject) => {
  // const domain = `routes.sydneytransitgraph.com`
  const domain = `routes.sydneytransitgraph.com.s3-website-ap-southeast-2.amazonaws.com`
  // const domain = `routes.sydneytransitgraph.com.s3-website-ap-southeast-2.amazonaws.com`
  const url = `http://${domain}/routes/routes.json`
    request({
      url,
    }, function (error, response, body) {
      if (error) {
        reject(error);
        return;
      }
      if (!(response && response.statusCode === 200)) {
        reject(`Response error:response code ${response.statusCode}`)
        return;
      }
      const routesJSONString: string = body;
      let routes: RouteInfo[];
      try {
        routes = JSON.parse(routesJSONString);
      } catch(e) {
        reject("Parsing route shape JSON failed.")
        return;
      }
      resolve(routes);
    })
  });
}


/**
 * Take a route and fetches the shape data for it from S3.
 * @param routeId Route id, the exact one specified in the routes.json
 */
export async function loadRouteShape(routeId:string): Promise<RoutePointInterface[]> {
  return new Promise((resolve, reject) => {
  const domain = `routes.sydneytransitgraph.com`
  const url = `https://${domain}/route-shapes/${routeId}.json`
    request({
      url,
    }, function (error, response, body) {
      if (error) {
        reject(error);
        return;
      }
      if(response?.statusCode === 404) {
        reject(`Error 404, unable to find route file. Check routeId, you may need to get it from getRoutes()`)
        return;
      }
      if (!(response && response.statusCode === 200)) {
        reject(`Response error:response code ${response.statusCode}`)
        return;
      }
      const routeShapeJSONString: string = body;
      let routeShape: RoutePointInterface[];
      try {
        routeShape = JSON.parse(routeShapeJSONString);
      } catch(e) {
        reject("Parsing route shape JSON failed.")
        return;
      }
      resolve(routeShape);
    })
  });
  }

export async function readRouteCSV(route_csv:string):
    Promise<RoutePointInterface[]> {
  const output:RoutePointInterface[] = []
  const stream = fs.createReadStream(route_csv)

  return new Promise((resolve, _reject) => {
    const csvStream = csv({
      headers: true
    })
    .on('data', (row:RouteCSVInterface) => {
      output.push(convertRawShapeWaypoint(row))
    })
    .on('end', () => {
      resolve(output);
    });
    stream.pipe(csvStream)
  });
}

