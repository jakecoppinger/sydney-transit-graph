import {
  PointWithId
} from "../../src/interfaces/interfaces";
import { findClosestPoint } from "../src/p5-object-lookup";
var assert = require("assert");

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
  // @ts-ignore
  console.log(reason.stack);
  // application specific logging, throwing an error, or other logic here
});

describe("#findClosestPoint()", async function () {
  it("returns undefined with empty list", () => {
    const points: PointWithId[] = [
    ];
    const searchPoint: PointWithId = {
      x: 4,
      y: 4,
      id: 'C'
    };
    assert(findClosestPoint(points, searchPoint) === undefined);
  });


  it("returns single point when only one point", () => {
    const A: PointWithId = {
      x: 0,
      y: 0,
      id: 'A',
    };
    const points: PointWithId[] = [
      A
    ];
    const searchPoint: PointWithId = {
      x: 4,
      y: 4,
      id: 'C'
    };
    assert(findClosestPoint(points, searchPoint).id === 'A');
  });
  it("returns closest point when closer to A than B", () => {
    const A: PointWithId = {
      x: 0,
      y: 0,
      id: 'A',
    };
    const B: PointWithId = {
      x: 10,
      y: 10,
      id: 'B'
    }
    const points: PointWithId[] = [
      A, B
    ];
    const searchPoint: PointWithId = {
      x: 4,
      y: 4,
      id: 'C'
    };
    assert(findClosestPoint(points, searchPoint).id === 'A');
  });
});
