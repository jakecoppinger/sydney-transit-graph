// import {MareyDB} from './marey-db-connector'
import { BusProgressWaypointInterface, FrontendBusProgressWaypointInterface} from '../interfaces/interfaces'
// import { BusProgressWaypointInterface, FrontendBusProgressWaypointInterface} from './interfaces';
import * as moment from 'moment';

/**
 * Convert progress waypoint with unix timestamp to ISO8601 equivalent
 * @param input Progress waypoint with unix timestamp
 */
export function convertProgressWaypoints(input: BusProgressWaypointInterface): FrontendBusProgressWaypointInterface {
    const newresult:any = input;
    newresult['human_timestamp']= moment.unix(input.measurement_timestamp).format();
    delete newresult['measurement_timestamp'];
    return newresult;
}

// export async function getChunkTripUpdates(bus:string, startTime: moment.Moment, 
//     endTime: moment.Moment): Promise<FrontendBusProgressWaypointInterface[]> {
//     const startUnixTime = startTime.unix();
//     const endUnixTime = endTime.unix();
//     const query = `select * from trip_updates where route = ${bus} and measurement_timestamp \
//     > ${startUnixTime} and measurement_timestamp < ${endUnixTime}`
//     console.log({query})

//     const db = await new MareyDB('../database/marey-db/full-mareydb.db')
//     await db.connect()

//     const results = await db.executeSelectQuery(query);
//     return results.map(convertProgressWaypoints);
// }
/**
 * Quantise waypoints only in jumps of given percentage. Assumes waypoints are 
 * sorted by percentage
 * @param waypoints List of Bus Progress Waypoints
 * @param quantisePercent Percentage before adding the next point
 */
export function quantiseBusProgressWaypoints(waypoints: FrontendBusProgressWaypointInterface[], 
    quantisePercent:number): FrontendBusProgressWaypointInterface[] {
    // - sort points in descending order by progress
    // - keep track of smalelest progress so far for each bus route id
    // - then when hit a point that is smaller by some threshold (some %), add it

    let output: FrontendBusProgressWaypointInterface[] = []
    let tripIdsMinPercent:any = {}

    for(let index = 0; index < waypoints.length; index++) {
        const waypoint = waypoints[index]
        const trip_id = waypoint.trip_id
        const progress = waypoint.progress
        if(!(trip_id in tripIdsMinPercent)) {
            tripIdsMinPercent[trip_id] = progress
            output.push(waypoint);
        } else {
            if(progress <= tripIdsMinPercent[trip_id] - quantisePercent ) {
                output.push(waypoint);
            }
        }
    }

    return output;
}

// export async function getQuantisedUpdates(bus:string, startTimestamp: number, 
//     endTimestamp: number, quantisePercent: number): Promise<FrontendBusProgressWaypointInterface[]> {
//     let query:string = `select * from trip_updates where route = ${bus} and measurement_timestamp \
//     > ${startTimestamp} and measurement_timestamp < ${endTimestamp}`
//     query += " order by progress desc"
//     console.log({query})

//     const db = await new MareyDB('../database/marey-db/full-mareydb.db')
//     await db.connect()

//     const raw_results:BusProgressWaypointInterface[] = await db.executeSelectQuery(query);
//     const results: FrontendBusProgressWaypointInterface[] = raw_results.map(convertProgressWaypoints);
//     return quantiseBusProgressWaypoints(results,quantisePercent);
// }
