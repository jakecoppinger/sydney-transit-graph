// REMEMBER: Run yarn build in frontend/ to copy types to frontend (invalid?)

export interface PointWithId {
  x: number,
  y: number,
  id: string
}
export interface S3ObjectList {
  filePaths: string[],
  folderPaths: string[],
}

export interface RoutePointInterface {
  shape_id: string,
  shape_pt_lat: number,
  shape_pt_lon: number,
  shape_pt_sequence: number,
  shape_dist_traveled: number
}

/**
 * The interface for storing dots that move on the map as you drag along the graph.
 */
export interface BusProgressCoordinate {
  lat: number,
  lon: number,
  /**
   * References the occupancy from FrontendBusProgressWaypointInterface
   */
  occupancy_status: number
  tripId: string;
}

/**
 * A dictionary of RoutePointInterface[], where the key is the bus route.
 */
export interface RouteShapesInterface { [key: string]: RoutePointInterface[] };

export interface FrontendBusProgressWaypointInterface {
  trip_id: string,
  route: string,
  trip_direction: number,
  // measurement_timestamp: number, //1514354747,
  human_timestamp: string,
  progress: number, //0
  occupancy_status: number, //2
  latitude: number, //-33.8858528137207,
  longitude: number, //151.203125,
}

export interface BusProgressWaypointInterface {
  trip_id: string,
  route: string,
  trip_direction: number,
  measurement_timestamp: number, //1514354747,
  // human_timestamp: string,
  progress: number, //0
  occupancy_status: number, //2
  latitude: number, //-33.8858528137207,
  longitude: number, //151.203125,
}

export interface RouteCSVInterface {
  shape_id: string,
  shape_pt_lat: string,
  shape_pt_lon: string,
  shape_pt_sequence: string,
  shape_dist_traveled: string,
}
export interface RouteInfo {
  /** The route_id field contains an ID that uniquely identifies a route. The route_id is dataset unique.
Constructed as “(CONTRACT ID)_(ROUTE ID)” For example: “2447_10A” */
  route_id: string,
  /** The O/SMBSC Contract ID, allocated by TfNSW. For Example: “2447”*/
  agency_id: string,

  /** The short code identifying the Route to the public. Sourced from the Bus Contracts Management System.
     For example: “10A”*/
  route_short_name: string,
  /** The long name identifying the Route to the public. Sourced from the Bus Contracts Management System.
For example: “Marrickville Metro to City”*/
  route_long_name: string,
  /**Note: TfNSW Variation.
Indicates the Bus Network that the Route belongs to. The Bus Network is defined by TfNSW
For example: “Sydney Buses Network”.*/
  route_desc: string,
  /**Note: TfNSW Variation.
Indicates the Route Type of the Route.
as per the extended GTFS route types following Hierarchical Vehicle Type (HVT) codes from the European TPEG standard
Refer to
https://support.google.com/transitpartners/answer/3520902?hl=en &ref_topic=1095593
For example: “700”.*/
  route_type: string
}

export interface RawBusUpdatePositionInterface {
  "latitude": number, //-33.89332580566406,
  "longitude": number, //151.25942993164062,
  "bearing": number, //276,
  "odometer": number, //0,
  "speed": number, //6.900000095367432
}

export interface RawBusUpdateInterface {
  "id": string, // "11954___382_1",
  "is_deleted": boolean, //false,
  "trip_update": any, //null,
  "vehicle": {
    "trip": {
      "trip_id": string, //"",
      "route_id": string, //"_382",
      "direction_id": number, //0,
      "start_time": string, //"15:12:22",
      "start_date": string, //"20171227",
      "schedule_relationship": number, //2
    },
    "vehicle": {
      "id": string, //"11954___382_1",
      "label": string, //"",
      "license_plate": string, //""
    },
    "position": RawBusUpdatePositionInterface | null,
    "current_stop_sequence": number, //0,
    "stop_id": string, //"",
    "current_status": number, //2,
    "timestamp": number, //1514348651,
    "congestion_level": number, //2,
    "occupancy_status": number, //2
  },
  "alert": any, //null
}


export interface SearchResultInterface {
  /** The route_id field contains an ID that uniquely identifies a route. The route_id is dataset unique.
Constructed as “(CONTRACT ID)_(ROUTE ID)” For example: “2447_10A” */
  route_id: string,
  /** The short code identifying the Route to the public. Sourced from the Bus Contracts Management System.
     For example: “10A”*/
  route_short_name: string,
  /** The long name identifying the Route to the public. Sourced from the Bus Contracts Management System.
For example: “Marrickville Metro to City”*/
  route_long_name: string,
  /**Note: TfNSW Variation.
Indicates the Bus Network that the Route belongs to. The Bus Network is defined by TfNSW
For example: “Sydney Buses Network”.*/
}
export interface MapboxFeatureInterface {
  id: number,
  type: "Feature",
  geometry: {
    type: "Point",
    coordinates: [number, number],
  },
}