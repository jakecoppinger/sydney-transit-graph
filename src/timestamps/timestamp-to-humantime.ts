import * as moment from "moment";

export function timestampToHumantime(ts: number): string {
 return moment(ts, 'X').format() ;
}