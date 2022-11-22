import * as p5 from "p5";
import { drawProgressLabels, drawTimestampLabels, drawBusTraces } from "../ui";
import { findClosestPoint } from '../p5-object-lookup';
import {
  FrontendBusProgressWaypointInterface,
  BusProgressCoordinate,
  PointWithId
} from "../interfaces";
import { fetchBusTraces } from "../bus-traces/fetch-bus-traces";
import { convertX, convertY } from "../conversions";
import { OurWindow } from "../frontend-only-interfaces";
import {
  defaultShortRouteId,
} from "../utils/config";
import { clamp } from "../utils/utils";
import * as moment from "moment";
import { drawMapPoints, updateMapPointSelection } from "../map/points";
import { updateRouteTitle } from '../ui'

function redrawBusTraces(p: p5, renderer: "webgl" | "p2d") {
  const traceWidth = p.windowWidth / 2;
  const busTraces = (window as OurWindow).globalBusTraces;
  const ph = p.createGraphics(traceWidth, p.windowHeight, renderer);
  if (busTraces === undefined) {
    throw new Error("Bus traces is undefined on window resize");
  }
  const { selectedTripId } = (window as OurWindow);
  const startTimestamp = moment((window as OurWindow).startTimestamp);
  const endTimestamp = moment((window as OurWindow).endTimestamp);
  drawBusTraces(ph, busTraces, startTimestamp, endTimestamp, selectedTripId);
  (window as OurWindow).pg = ph;
  p.resizeCanvas(traceWidth, p.windowHeight);
}

export const sketch = (p: p5) => {
  const renderer = p.P2D; // p.WEBGL;
  // const renderer = p.WEBGL;
  p.preload = () => {
    // p.typeface = p.loadFont("fonts/Akzidenz Grotesk Pro Med Regular.otf");
  };

  p.setup = () => {
    const width = p.windowWidth / 2;
    updateRouteTitle(defaultShortRouteId);

    p.frameRate(60);
    p.createCanvas(width, p.windowHeight, renderer);
    const startTimestamp = moment((window as OurWindow).startTimestamp);
    const endTimestamp = moment((window as OurWindow).endTimestamp);

    const {routeId} = (window as OurWindow);

    fetchBusTraces(
      routeId,
      startTimestamp,
      endTimestamp,
      (busTraces: FrontendBusProgressWaypointInterface[]) => {
        (window as OurWindow).globalBusTraces = busTraces;

        const startTime = new Date();
        const pg = p.createGraphics(width, p.windowHeight, renderer);
        // drawBusTraces(
        const tracePoints: PointWithId[] = drawBusTraces(
          pg,
          busTraces,
          startTimestamp,
          endTimestamp
        );
        (window as OurWindow).pg = pg;
        (window as OurWindow).busTracePoints = tracePoints;

        const duration = (new Date() as any) - (startTime as any);
        console.log("drew visualisation in ", duration);
      }
    );
  };

  p.windowResized = () => {
    redrawBusTraces(p, renderer);
  };
  p.mousePressed = () => {
    const { busTracePoints } = (window as OurWindow);
    if (busTracePoints === undefined) {
      return;
    }
    if (p.mouseX < 0 || p.mouseY < 0) {
      return; // Don't do anything for mouse clicks outside p5js
    }
    const searchPoint: PointWithId = {
      x: p.mouseX,
      y: p.mouseY,
      id: 'mouse'
    };
    const closestPoint = findClosestPoint(busTracePoints, searchPoint);
    if (closestPoint === undefined) {
      return;
    }

    // Store the selected point, and previous (to be able to remove selection on map)
    (window as OurWindow).selectedTripId = closestPoint.id;

    redrawBusTraces(p, renderer);
    updateMapPointSelection();
  };
  p.draw = () => {
    const traceWidth = p.windowWidth / 2;
    const height = p.windowHeight;

    p.background(25, 25, 25); // Same colour as mapbox dark water
    const pg = (window as OurWindow).pg;
    if (pg) {
      p.image(pg, convertX(p, 0), convertY(p, 0), traceWidth, p.windowHeight);
    }
    drawProgressLabels(p);
    const startTimestamp = moment((window as OurWindow).startTimestamp);
    const endTimestamp = moment((window as OurWindow).endTimestamp);
    drawTimestampLabels(p, startTimestamp, endTimestamp);
    // p.fill(127, 0, 0);
    p.stroke(255);
    p.strokeWeight(1);
    // console.log("drawing..")
    // console.log("mousex:",p.mouseX);
    // console.log("mousey:",p.mouseY);
    // p.line(p.mouseX - (p.windowWidth/2),-p.windowHeight/2,p.mouseX - (p.windowWidth/2), p.windowHeight/2)

    // Progress line
    p.line(
      convertX(p, p.mouseX),
      convertY(p, 0),
      convertX(p, p.mouseX),
      convertY(p, height)
    );

    const { mouseX } = p;
    const newMouseProgress = clamp(mouseX / traceWidth, 0, 1);
    const { globalMouseProgress } = window as OurWindow;

    if((window as OurWindow).busTracePoints === undefined) {
      // Draw loading text
      p.text("Loading...", p.windowWidth/4,p.windowHeight/2);
    }

    if (newMouseProgress !== globalMouseProgress) {
      const mousePosTime = moment(startTimestamp); // We're mutating this
      const totalDuration = endTimestamp.diff(
        startTimestamp,
        "seconds"
      );
      const mouseSecondsOffset = totalDuration * newMouseProgress;
      mousePosTime.add(mouseSecondsOffset, "seconds");

      // const text = mousePosTime.format("dd h:mma");

      const humanMouseTime = mousePosTime.toISOString();
      (window as OurWindow).globalMouseProgress = newMouseProgress;
      drawMapPoints(p, humanMouseTime);
    }
  };
};
