import * as p5 from "p5";
import { OurWindow } from "../frontend-only-interfaces";
import { MapboxFeatureInterface } from "../interfaces";
import { getCoordinatesForTimestamp } from "../time-to-coords";
import { busProgressCoordToPoint } from "./mapbox";

/**
 * Update the map point selection using the global seleted trip id.
 * Returns without error if the trip id is not found.
*/
export function updateMapPointSelection(): void {
  const {
    globalMap,
    mapPointCoords,
    oldSelectedPointIndex,
    selectedTripId
  } = window as OurWindow;

  if (mapPointCoords === undefined || globalMap === undefined) {
    return;
  }

  let selectedPointIndex = mapPointCoords.findIndex(point => point.tripId === selectedTripId);
  if (selectedPointIndex === -1) {
    return;
  }

  // Change the old selected point to not be selected any more
  if (oldSelectedPointIndex !== undefined) {
    globalMap.setFeatureState({ source: 'points', id: oldSelectedPointIndex }, { selected: false });
  }
  if (selectedPointIndex !== undefined) {
    globalMap.setFeatureState({ source: 'points', id: selectedPointIndex }, { selected: true });
  }
  (window as OurWindow).oldSelectedPointIndex = selectedPointIndex;
}

/**
 * Draw dots on the map corresponding to the selected progress in the graph
 * @param p P5 Object
 * @param humanMouseTime ISO8601 timestamp of the time indicated by the mouse movement on the graph
 */
export function drawMapPoints(p: p5, humanMouseTime: string): void {
  const {
    globalBusTraces,
    globalMouseProgress,
  } = window as OurWindow;
  if (
    globalBusTraces === undefined ||
    globalMouseProgress === undefined
  ) {
    return;
  }
  const mapPointCoords = getCoordinatesForTimestamp(
    humanMouseTime,
    globalBusTraces
  );
  (window as OurWindow).mapPointCoords = mapPointCoords;

  const features = mapPointCoords.map((point, index) =>
    busProgressCoordToPoint(index, point)
  );
  setMapboxFeatures(features);
  updateMapPointSelection();
}

export function setMapboxFeatures(features: MapboxFeatureInterface[]): void {
  const {
    globalMap,
  } = window as OurWindow;
  if (globalMap === undefined) {
    return;
  }

  // @ts-ignore
  globalMap.getSource("points").setData({
    type: "FeatureCollection",
    features: features,
  });
}