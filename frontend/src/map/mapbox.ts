import { BusProgressCoordinate, MapboxFeatureInterface } from "../interfaces";

/**
 * Create Mapbox feature object from one of our points. ID is the index.
 * @param index, used for the ID attribute
 * @param point
 */
export function busProgressCoordToPoint(index: number, point: BusProgressCoordinate): MapboxFeatureInterface {
  const { lat, lon } = point;
  return {
    id: index,
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [lon, lat],
    },
  };
}
