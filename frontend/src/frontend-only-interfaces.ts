import { BusProgressCoordinate, FrontendBusProgressWaypointInterface, PointWithId } from "./interfaces";

import * as p5 from "p5";

export interface GlobalState {
  pg: p5.Graphics | undefined;
  globalBusTraces: FrontendBusProgressWaypointInterface[] | undefined;
  p5_object: p5 | undefined;
  globalMap: mapboxgl.Map | undefined;
  globalMouseProgress: number | undefined;
  selectedTripId: string | undefined;
  oldSelectedPointIndex: number | undefined;
  mapPointCoords: BusProgressCoordinate[] | undefined;
  busTracePoints: PointWithId[] | undefined;
  /** The earlier time (left), aka subtracted */
  startTimestamp: string;
  /** The later time (right) */
  endTimestamp: string;
  routeId: string;
}

export type OurWindow = Window & GlobalState & typeof globalThis;
