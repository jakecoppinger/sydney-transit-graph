export interface Point {
  x?: number;
  y?: number;
}
export enum Occupancy {
  EMPTY = 0,
  MANY_SEATS_AVAILABLE,
  FEW_SEATS_AVAILABLE,
  STANDING_ROOM_ONLY,
  CRUSHED_STANDING_ROOM_ONLY,
}
