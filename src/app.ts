import * as express from 'express';
import * as moment from 'moment'
import { getPositionsBetweenTimes} from './data-processing/get-positions-between-times';
import { getRoutes } from './filesystem/read-route-csv'
import * as fuzz from 'fuzzball';
import { FrontendBusProgressWaypointInterface,BusProgressWaypointInterface, RouteInfo, SearchResultInterface } 
  from './interfaces/interfaces';

import { convertProgressWaypoints} from './data-processing/business-layer';

const app = express();
app.use(function(req, res, next) {
  req;
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.set('json spaces', 2);

app.get('/', (request:any, response:any) => {
  request;
  response.send('Hello world deply 30th oct v3!');
});

const routesPromise = getRoutes();
/** Short routes, then long routes */
let searchChoices: string[];
let routes: RouteInfo[];
let numRoutes: number;

app.post('/v3/search_routes', async function (req, res) {
  res.type('json')
  const params = req.query

  const searchStringRaw = req.query.search_string;

  if(typeof searchStringRaw !== 'string') {
    res.status(400);
    res.send("query parameter search_string invalid.");
    return;
  }
  const searchString = searchStringRaw as string;
  if(searchChoices === undefined) {
    // https://github.com/nol13/fuzzball.js
    routes = await routesPromise;
    numRoutes = routes.length
    searchChoices = []
      .concat(routes.map(r => r.route_short_name))
      .concat(routes.map(r => r.route_long_name))
  }

  const options = {scorer: fuzz.token_set_ratio};
  const rawResults = fuzz.extract(searchString, searchChoices, options);
  // // [choice, score, index/key]
  const limitedRawResults = rawResults.slice(0,3)
  const searchResults: SearchResultInterface[] = limitedRawResults.map(r => {
    const route: RouteInfo = routes[r[2] % numRoutes];
    const {route_id, route_short_name, route_long_name} = route;
    return { route_id, route_short_name, route_long_name }
  })
  res.json(searchResults)
});

app.post('/v3/bus_progress_waypoints', async function (req, res) {
  res.type('json')
  const params = req.query
  console.log("got request on bus_progress_waypoints");

  const startTimeStr = req.query.start_time;
  const endTimeStr = req.query.end_time;
  const routeIdRaw = req.query.route_id;
  const maxFilesAccessedRaw = req.query.max_files_accessed;

  if(typeof routeIdRaw !== 'string') {
    res.status(400);
    res.send("query parameter route_id invalid.");
    return;
  }
  const routeId = routeIdRaw as string;

  if(routeId.length < 5) {
    res.status(400);
    res.send("route_id is definitely too short.\neg. for 370, use 55-370-sj2-1. There's more than one 370 :)");
    return;
  }

  if(!startTimeStr || !endTimeStr || typeof startTimeStr !== 'string' || typeof endTimeStr !== 'string' ) {
    res.status(400);
    res.send("start_time or end_time args missing from params!");
    return;
  }

  if(!maxFilesAccessedRaw || typeof maxFilesAccessedRaw !== 'string' ) {
    res.status(400);
    res.send("max_files_accessed is missing from params!");
    return;
  }

  let maxFilesAccessed: number;
  try {
    maxFilesAccessed = parseInt(maxFilesAccessedRaw as string);
  } catch {
    res.status(400);
    res.send("max_files_accessed isn't an integer!");
    return;
  }
  // +s replaced with spaces for some reason I should
  // probs know
  const startTime: number = moment(startTimeStr.replace(" ", "+")).unix()
  const endTime: number = moment(endTimeStr.replace(" ", "+")).unix()


  let routes: RouteInfo[];
  try {
    console.log("About to hit getRoutes...");
    routes = await getRoutes();
  } catch(e) {
    res.status(400);
    res.send("Unable to fetch routes file");
    return;
  }

  // Find our specified route from the routes.json using the route id given as a param
  const route: RouteInfo | undefined = routes.find(route => route.route_id ===routeId);
  if(route === undefined) {
    res.status(400);
    res.send("Unable to find specified route_id in routes API.");
    return;
  }
  const routeShortName = route.route_short_name;
  const routeAgencyId = route.agency_id;

  let allPositions;
  try {
    console.log("About to hit getPositionsBetweenTimes...");
    allPositions = await getPositionsBetweenTimes(startTime, endTime, routeId,routeShortName,routeAgencyId, maxFilesAccessed);
  } catch(e) {
    res.status(400);
    console.error(`error in getting positions: ${e}`);
    res.send(`error in getting positions: ${e}`);
    return;
  }

  const output: FrontendBusProgressWaypointInterface[] =
    allPositions.map(convertProgressWaypoints);
  res.json(output)
})

export default app;