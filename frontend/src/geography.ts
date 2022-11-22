// Converts from radians to degrees.
export function radiansToDegrees(radians: number) {
  return (radians * 180) / Math.PI;
}
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export interface Coordinate {
  lat: number;
  lon: number;
}

export function getDistance(start: Coordinate, end: Coordinate): number {
  var earthRadius = 6371; // km
  // TODO: clean this up and use const
  var lat1 = start.lat;
  var lat2 = end.lat;
  var lon1 = start.lon;
  var lon2 = end.lon;

  var dLat = degreesToRadians(lat2 - lat1);
  var dLon = degreesToRadians(lon2 - lon1);
  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = earthRadius * c;
  return d;
}

export function bearing(start: Coordinate, end: Coordinate): number {
  const startLat = degreesToRadians(start.lat);
  const startLng = degreesToRadians(start.lon);
  const destLat = degreesToRadians(end.lat);
  const destLng = degreesToRadians(end.lon);
  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x =
    Math.cos(startLat) * Math.sin(destLat) -
    Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  const brng = Math.atan2(y, x);
  const degreesBaring = radiansToDegrees(brng);

  return (degreesBaring + 360) % 360;
}
