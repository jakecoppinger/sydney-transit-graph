import * as sqlite3 from 'sqlite3';
import {BusProgressWaypointInterface} from '../interfaces/interfaces';
import { resolve } from 'dns';
import { rejects } from 'assert';

// @ts-ignore
if (!Array.prototype.flat) {
    // @ts-ignore
    Array.prototype.flat = function() {
      var depth = arguments[0];
      depth = depth === undefined ? 1 : Math.floor(depth);
      if (depth < 1) return Array.prototype.slice.call(this);
      return (function flat(arr, depth) {
        var len = arr.length >>> 0;
        var flattened:any = [];
        var i = 0;
        while (i < len) {
          if (i in arr) {
            var el = arr[i];
            if (Array.isArray(el) && depth > 0)
              flattened = flattened.concat(flat(el, depth - 1));
            else flattened.push(el);
          }
          i++;
        }
        return flattened;
      })(this, depth);
    };
  }

export class MareyDB { 
    db: sqlite3.Database;
    databasePath: string
    connected: boolean

    constructor(databasePath:string) { 
        this.databasePath = databasePath;
        this.connected = false;
    }

    async connect():Promise<void> {
        this.db = await this._connect()
        this.connected = true;
    }

    async _connect():Promise<sqlite3.Database> {
        return new Promise((resolve:any, reject:any) => {
            const db = new sqlite3.Database(this.databasePath, (err:any) => {
                if(err) {
                    reject(err)
                }
                resolve(db)
            });
        });
    }
    
    /**
     * Execute an insert query on the database
     * @param query SQL query string
     * @param params Ordered list of parameters that will be substituded into
     * query
     */
    async executeInsertQuery(query:string, params:any[]): Promise<null> {
        this.checkIfConnected();
        return this._executeInsertQuery(this.db, query, params)
    }

    async _executeInsertQuery(db:sqlite3.Database, query:string, params:any[]):
    Promise<null> {
        return new Promise((resolve:any, reject:any) => {
            db.run(query,params,(err) => {
                if(err) {
                    reject(err);
                }
                resolve();
            })
        })
    }

    /**
     * Run a select query on the database
     * @param query The SQL select query
     */
    async executeSelectQuery(query: string): Promise<any> {
        this.checkIfConnected();
        return await this._executeSelectQuery(this.db,query);
    }
    async _executeSelectQuery(db:sqlite3.Database, query: string): Promise<any> {
        return new Promise((resolve:any, reject:any) => {
            db.all(query,(err, rows) => {
                if(err) {
                    reject(err);
                }
                resolve(rows);
            });
        })
    }

    static _waypointToValuesArray(update: BusProgressWaypointInterface): any[] {
        const insertParams = [
            update.trip_id,
            update.route,
            update.trip_direction,
            update.measurement_timestamp,
            update.progress,
            update.occupancy_status,
            update.latitude,
            update.longitude
        ]
        return insertParams;
    }

    /**
     * Insert a bus waypoint object into the database
     * @param update The bus update object
     */
    async insertProgressWaypoint(update: BusProgressWaypointInterface): 
        Promise<void> {
        this.checkIfConnected();
        const insertQuery = "insert into trip_updates values(?,?,?,?,?,?,?,?)";
        const insertParams = MareyDB._waypointToValuesArray(update);

        return await this.executeInsertQuery(insertQuery, insertParams);
    }

    /**
     * Insert a bus waypoint into the database ONLY IF if does not already exit
     * @param update The bus update object
     */
    async deduplicateInsertProgressWaypoint(
        update: BusProgressWaypointInterface): Promise<void> {
        this.checkIfConnected();
        const insertQuery = 
            "insert or ignore into trip_updates values(?,?,?,?,?,?,?,?)";
        const insertParams = MareyDB._waypointToValuesArray(update);
        return await this.executeInsertQuery(insertQuery, insertParams);
    }

    /**
     * Insert multiple progress waypoints into a database at a time. DOES NOT
     * deduplicate them!
     * @param updates List of progress waypoint updates
     */
    async batchInsertProgressWaypoints(
        updates: BusProgressWaypointInterface[]): Promise<void> {
        this.checkIfConnected();
        const numUpdates = updates.length
        const statements:[string,any[]][] = updates.map(update => [
            "insert or ignore into trip_updates values(?,?,?,?,?,?,?,?)",
            MareyDB._waypointToValuesArray(update)
        ])

        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.exec("BEGIN")
                for(const queryObj of statements) {
                    const query = queryObj[0]
                    const params = queryObj[1]
                    this.db.run(query, params);
                }
                this.db.exec("COMMIT")
            });

            
            this.db.close((err:Error) => {
                if(err) {
                    reject(err);
                }
                this.connected = false;
                resolve()
            })
        })
    }

    /**
     * Read a number of progress waypoints from the database
     * @param query The SQL query, must start with "select * from
     * trip_updates..."
     */
    async readProgressWaypoints(query: string):
        Promise<BusProgressWaypointInterface[]> {
            this.checkIfConnected();
            return await this.executeSelectQuery(query);
    }

    checkIfConnected(): void {
        if(!this.connected) {
            throw 'Error: DB not connected';
        }
    }

    async close():Promise<void> {
        if(!this.connected) {
            throw "Error: Can't close DB that isn't connected";
        }
        this.connected = false;
        return new Promise((resolve:any, reject:any) => {
            if(!this.db) {
                reject("this.db doesn't exist, maybe already closed?");
            }

            this.db.close((err:Error) => {
                if(err) {
                    reject(err);
                }
                resolve()
            })
        });
    }
}
