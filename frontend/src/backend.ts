import * as https from "https";
import * as http from "http";
import { FrontendBusProgressWaypointInterface } from "./interfaces";
import { getConfig } from "./utils/config";
import * as moment from "moment";

/**
 * Generate options for the POST request
 * @param route Bus route number
 * @param startTimestamp Earliest possible bus time
 * @param endTimestamp Last possible bus time
 * @param maxFilesToAccess The max number of files to retrieve timestamps from
 */
function generateOptions(
  routeId: string,
  startTime: moment.Moment,
  endTime: moment.Moment,
  maxFilesToAccess: number
) {
  const startTimestamp = startTime.format();
  const endTimestamp = endTime.format();

  const params = [
    `route_id=${routeId}`,
    `start_time=${startTimestamp}`,
    `end_time=${endTimestamp}`,
    `max_files_accessed=${maxFilesToAccess}`,
  ].join("&");

  const { backendServerHostname, backendServerPort } = getConfig();
  const hostname = backendServerHostname;
  const port = backendServerPort;

  const path = `/v3/bus_progress_waypoints?` + params;
  return {
    hostname,
    port,
    path,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };
}
export async function makeBusTraceRequest(
  routeId: string,
  startTimestamp: moment.Moment,
  endTimestamp: moment.Moment,
  maxFilesAccessed: number
): Promise<FrontendBusProgressWaypointInterface[][]> {
  const options = generateOptions(
    routeId,
    startTimestamp,
    endTimestamp,
    maxFilesAccessed
  );
  const { hostname, port, path } = options;
  console.log("Path");
  console.log(`${hostname}:${port}${path} (should ignore port placment)`);
  return new Promise((resolve, reject) => {
    const { isBackendServerSecure } = getConfig();
    const httpLib = isBackendServerSecure ? https : http;
    var req = httpLib.request(options, function (res) {
      var body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (body += chunk));
      res.on("end", function () {
        const jsonResponse = JSON.parse(body);
        const bars: FrontendBusProgressWaypointInterface[][] = jsonResponse;
        resolve(bars);
      });
    });
    req.on("error", function (e) {
      reject(e.message);
    });
    req.end();
  });
}
