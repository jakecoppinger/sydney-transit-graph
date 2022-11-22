  // - Handling click events on the lines:
  //   - make library which stores fast lookup data structure for figuring out which line was clicked.
  //   - What does this look like?
  //     - Index by horizontal pixels
  //     - then naive implementation: for loop through keys in the horizontal pixel bucket until right one found
  //     - should be able to binary search this though if it's sorted though right?


/*
Rough ideas:
for each horizontal (x) coordinate:
  compute edges for "watersheds" between closest lines


eg.
add line A at height 50 (0-100 say)
one segment, point to A

add second line at height 25
two segments, one 0 -> 37.5, next from 37.5 -> 100
-------
new idea
binary search two arrays, one sorted x points in a line, one sorted y points in a line
--------
just store all points graphed
just calculate closest point to the cursor location

*/
import { PointWithId } from "./interfaces";

export function addPoint(pointStore: PointWithId[], newPoint: PointWithId) {
  pointStore.push(newPoint);
}

export function dist (a: PointWithId, b: PointWithId) {
    return (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
};


export function findClosestPoint(pointStore: PointWithId[], searchPoint: PointWithId): PointWithId | undefined {
  if(pointStore.length === 0) {
    return undefined;
  }
  let closestPoint = pointStore[0];
  let minDist = dist(closestPoint, searchPoint);
  pointStore.forEach(point => {
    const currDist = dist(point, searchPoint)
    if(currDist < minDist) {
      minDist = currDist;
      closestPoint = point;
    }
  });
  return closestPoint;
}