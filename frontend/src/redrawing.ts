import * as moment from "moment";
import { OurWindow } from "./frontend-only-interfaces";
import { fetchBusTraces } from "./bus-traces/fetch-bus-traces";
import { drawBusTraces } from "./ui";
import {
  FrontendBusProgressWaypointInterface,
} from "./interfaces";

export function redrawBusTraces(): void {
  const { p5_object: p5, routeId } = (window as OurWindow);
  (window as OurWindow).busTracePoints = undefined

  console.log("Fetching bus traces...");

  if (p5 === undefined) {
    throw new Error("p5 not found on window object");
  }

  const width = p5.windowWidth / 2;
  const pg = p5.createGraphics(width, p5.windowHeight, p5.P2D);
  (window as OurWindow).pg = pg;

  if (pg === undefined) {
    throw new Error(
      "graphics object undefined when attempting to redraw in search"
    );
  }

  const { startTimestamp, endTimestamp } = (window as OurWindow);
  const momentStartTimestamp = moment(startTimestamp);
  const momentEndTimestamp = moment(endTimestamp);

  fetchBusTraces(
    routeId,
    moment(startTimestamp),
    moment(endTimestamp),
    (busTraces: FrontendBusProgressWaypointInterface[]) => {
      (window as OurWindow).busTracePoints = drawBusTraces(pg, busTraces, momentStartTimestamp, momentEndTimestamp);
      (window as OurWindow).globalBusTraces = busTraces;
    }
  );
}