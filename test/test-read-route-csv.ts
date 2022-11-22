import { RouteInfo } from "../src/interfaces/interfaces";
import {getRoutes} from "../src/filesystem/read-route-csv"
var assert = require('assert');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // @ts-ignore
  console.log(reason.stack)
  // application specific logging, throwing an error, or other logic here
});

describe('#getRoutes()', async function () {
  it(`should get routes which includes 370`, async function () {
    const routes: RouteInfo[] = await getRoutes();
    const route370: RouteInfo | undefined = routes.find(route => route.route_short_name === "370");
    assert(route370.route_id === "31-370-sj2-1");
    assert(route370.route_long_name === 'Leichhardt Marketplace to Coogee');
  }).timeout(5000);
});
