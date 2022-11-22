
export interface RoutePointInterface {
    shape_id: string,
    shape_pt_lat: number,
    shape_pt_lon: number,
    shape_pt_sequence: number,
    shape_dist_traveled: number
}

export interface RouteShapesInterface { [key: string]: RoutePointInterface[]}; 

export interface FrontendBusProgressWaypointInterface {
    trip_id:string,
    route:string,
    trip_direction:number,
    // measurement_timestamp: number, //1514354747,
    human_timestamp: string,
    progress: number, //0
    occupancy_status: number, //2
    latitude: number, //-33.8858528137207,
    longitude: number, //151.203125,
}

export interface BusProgressWaypointInterface {
    trip_id:string,
    route:string,
    trip_direction:number,
    measurement_timestamp: number, //1514354747,
    // human_timestamp: string,
    progress: number, //0
    occupancy_status: number, //2
    latitude: number, //-33.8858528137207,
    longitude: number, //151.203125,
}

export interface RouteCSVInterface {
    shape_id: string,
    shape_pt_lat:string,
    shape_pt_lon:string,
    shape_pt_sequence: string,
    shape_dist_traveled: string,
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
