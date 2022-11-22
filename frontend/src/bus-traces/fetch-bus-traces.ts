import { FrontendBusProgressWaypointInterface } from "../interfaces";
import { makeBusTraceRequest } from "../backend";
import * as moment from "moment";

/** Fetch bus traces and call callback with the traces */
export async function fetchBusTraces(
  routeId: string,
  startTimestamp: moment.Moment,
  endTimestamp: moment.Moment,
  callback: Function
): Promise<void> {
  console.log("Started POST request...");
  try {
    const maxFilesAccessed = 30;
    const busTraces: FrontendBusProgressWaypointInterface[][] = await makeBusTraceRequest(
      routeId,
      startTimestamp,
      endTimestamp,
      maxFilesAccessed
    );
    console.log({ busTraces });
    console.log("Finished POST request.");
    callback(busTraces);
  } catch (e) {
    alert(`Failed to fetch bus positions - please try reloading :)`);
  }
}
