import * as p5 from "p5";
// @ts-ignore
// import p5 from "p5/lib/p5.min.js"
// p5.disableFriendlyErrors = true;
import * as moment from "moment";
import { FrontendBusProgressWaypointInterface, PointWithId } from "./interfaces";
import { Point, Occupancy } from "./frontend-interfaces";
import { convertX, convertY } from "./conversions";
import { routeIdSelector } from "./selectors";


/**
 * Set the route number inside the title
 * @param shortRouteId Short bus number
 */
export function updateRouteTitle(shortRouteId: string): void {
  const routeIdObject = document.querySelector(routeIdSelector)
    if(routeIdObject) {
      routeIdObject.textContent = ` / ${shortRouteId}`;
    }
}

/**
 * Generate colour for an occupancy code
 * @param p  p5
 * @param occupancy_status number
 */
function lookupOccupanceColour(p: p5, occupancy_status: number): p5.Color {
  if (occupancy_status == Occupancy.EMPTY) {
    return p.color("green");
  } else if (occupancy_status == Occupancy.MANY_SEATS_AVAILABLE) {
    return p.color(30, 120, 113);
  } else if (occupancy_status == Occupancy.FEW_SEATS_AVAILABLE) {
    return p.color("orange");
  } else if (occupancy_status == Occupancy.STANDING_ROOM_ONLY) {
    return p.color("red");
  }
  return p.color("white");
}

export function drawProgressLabels(p: p5): void {
  const numLabels = 15;
  const labelX = 30;

  const pixelsPerLabel = p.windowHeight / numLabels;
  p.textFont("Helvetica Neue");
  p.noStroke();
  p.fill(230);
  p.textSize(15);

  for (let labelY = 0; labelY < p.windowHeight; labelY += pixelsPerLabel) {
    const percentText = Math.round((labelY / p.windowHeight) * 100) + "%";
    p.text(percentText, labelX, labelY);
  }
}

/** Draw timestamp labels across top of graph */
export function drawTimestampLabels(
  p: p5,
  startTimestamp: moment.Moment,
  endTimestamp: moment.Moment
): void {
  const width = p.windowWidth / 2;
  const numLabels = 5;
  const totalDuration = endTimestamp.diff(startTimestamp, "seconds");
  const timePerLabel = totalDuration / numLabels;

  const textY = 30;
  const lineStartY = 30;
  const lineEndY = 40;
  p.textFont("Helvetica Neue");
  p.textAlign(p.CENTER, p.BOTTOM);
  p.fill(230);
  p.textSize(15);
  for (
    let labelTime = moment(startTimestamp);
    labelTime <= endTimestamp;
    labelTime.add(timePerLabel, "seconds")
  ) {
    const timePassed = labelTime.diff(startTimestamp, "seconds");
    const textX = (timePassed / totalDuration) * width;

    let labelText = labelTime.format("dd h:mma"); // dd h:mma
    p.noStroke();
    p.text(labelText, textX, textY);
    p.strokeWeight(2);
    p.stroke(125, 0, 0);
    p.line(textX, lineStartY, textX, lineEndY);
  }
}

/**
 * Draw the lines of the buses
 * @param p p5
 * @param busTraces Bus data
 * @param startTimestamp Start timestamp of graph
 * @param endTimestamp End timestamp of graph
 * @returns List of points which make up the lines. Each point contains the trip id
 */
export function drawBusTraces(
  rawP: p5.Graphics,
  busTraces: FrontendBusProgressWaypointInterface[],
  startTimestamp: moment.Moment,
  endTimestamp: moment.Moment,
  selectedTripId?: string
): PointWithId[] {
  // @ts-ignore
  const p = rawP as p5;

  const tripIds: string[] = busTraces.map((trace) => trace.trip_id);

  const height = p.height;
  const width = p.width;
  console.log(`Width inside drawBusTraces: ${width}`);
  
  const points: PointWithId[] = []

  for (const tripId of tripIds) {
    /** Only waypoints of the selected trace */
    const selectedTraces = busTraces.filter((trace) => tripId == trace.trip_id);

    let isFirstPoint = true;
    let lastPoint: Point = {
      x: undefined,
      y: undefined,
    };
    if(tripId === selectedTripId) {
      p.strokeWeight(9);
    } else {
      p.strokeWeight(3);
    }

    /** Remember last occupancy status so only changing stroke colour when required */
    let lastOccupancyStatus = -1;

    /** Number of seconds shown on graph (between first and last timestamp) */
    const startEndTimestampDelta = endTimestamp.diff(startTimestamp, "seconds");

    for (const progressWaypoint of selectedTraces) {
      const timestampProgress =
        moment(progressWaypoint.human_timestamp).diff(
          startTimestamp,
          "seconds"
        ) / startEndTimestampDelta;

      // Update Colour when occupancy changes
      if (progressWaypoint.occupancy_status !== lastOccupancyStatus) {
        const colour = p.color(
          lookupOccupanceColour(p, progressWaypoint.occupancy_status)
        );
        p.stroke(colour);

        lastOccupancyStatus = progressWaypoint.occupancy_status;
      }

      const newPoint = {
        x: timestampProgress * width,
        y: progressWaypoint.progress * height,
      };

      if (!isFirstPoint) {
        // lastPoint will definitely be defined in this case, as we set lastpoint after the first
        // loop.
        const x1 = convertX(p, lastPoint.x as number);
        const y1 = convertY(p, lastPoint.y as number);
        const x2 = convertX(p, newPoint.x);
        const y2 = convertY(p, newPoint.y);

        p.line(
          x1,y1,x2,y2
        );

        // TODO: Add points in between the line endpoints to the lookup array
        points.push({
          x: x1,
          y: y1,
          id: tripId
        })

      } else {
        isFirstPoint = false;
      }
      lastPoint = newPoint;
    }
  }
  return points;
}
