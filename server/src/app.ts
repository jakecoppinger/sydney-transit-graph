import * as express from 'express';
import * as moment from 'moment'

import { FrontendBusProgressWaypointInterface } from './interfaces';
import { getChunkTripUpdates } from './business-layer';

const app = express();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.set('json spaces', 2);
 
app.get('/', (request:any, response:any) => {
  response.send('Hello world deploy 30th oct v2!');
});

app.post('/v2/bus_progress_waypoints', async function (req, res) {
  res.type('json')
  const params = req.query
  const route = req.query.route;

  const startTimeStr = req.query.start_time;
  const endTimeStr = req.query.end_time;

  if(!startTimeStr || !endTimeStr) {
    res.status(400);
    res.send("start_time or end_time args missing from params!");
  }
  // +s replaced with spaces for some reason I should
  // probs know
  const startTime = moment(startTimeStr.replace(" ", "+"))
  const endTime = moment(endTimeStr.replace(" ", "+"))
  const output:FrontendBusProgressWaypointInterface[] =
    await getChunkTripUpdates(route,startTime,endTime);
  res.json(output)
})

app.listen(5000, function() {
    console.log('SERVER UP!');
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});