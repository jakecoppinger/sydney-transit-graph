import * as express from 'express';
import { timestampSelection } from './timestamps/timestamp-operations';
import * as fs from "fs";
import * as moment from 'moment'
import { isConstructorDeclaration } from 'typescript';

const timestampFilePath = "./data/stored-timestamps.log";

const app = express();
app.use(function (req, res, next) {
  req;
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.set('json spaces', 2);

// app.get('/', (request: any, response: any) => {
//   request;
//   response.send('Hello world!');
// });

/*
API:

/get_timestamps

Input:
start_timestamp
end_timestamp
quantity
Output:
List of timestamp strings

/add_timestamp
Input:
timestamp
Output: void

/flush
No input or output
Save all timestamps in memory to a file
*/


const rawTimestampText = fs.readFileSync(timestampFilePath, "utf-8");

let timestamps: number[] = rawTimestampText.split("\n")
  .filter(s => s && s.length != 0)
  .map(s => parseInt(s));

function sortTimestamps() {
  timestamps.sort()
  // timestamps.sort((a, b) => b - a)
}

sortTimestamps();

app.post('/v1/add_timestamp', async function (req, res) {
  res.type('json')
  const params = req.query

  const timestampRaw = req.query.timestamp;
  let timestamp: number;
  if (!timestampRaw) {
    res.status(400);
    res.send("query param timestamp is missing");
    console.log(`400: query param timestamp is missing, query: ${req.query}`);
    return;
  }

  try {
    timestamp = parseInt(timestampRaw as string);
  } catch (e) {
    res.status(400);
    res.send("query parameter timestmap isn't string");
    console.log(`400: timestamp isn't string, timestamp: ${timestamp}`);
    return;
  }

  timestamps.push(timestamp);

  sortTimestamps();

  // Save timestamp array to file
  let rawTimestampText: string;

  try {
    const newRawTimestampText: string = timestamps.join('\n');
    fs.writeFileSync(timestampFilePath, newRawTimestampText, 'utf8');
  } catch (e) {
    res.status(400);
    res.send("Couldn't write timestamps to file");
    console.log(`400: couldn't write timestamps to file`);
    return;
  }

  const statusText = `Successfully added timestamp ${timestamp}`
  console.log(statusText);
  res.json({ status: statusText });
})

app.post('/v1/get_timestamps_unix', async function (req, res) {
  res.type('json')
  const params = req.query

  const startTimestampRaw = req.query.start_timestamp;
  const endTimestampRaw = req.query.end_timestamp;
  const quantityRaw = req.query.quantity;

  let startTimestamp: number;
  let endTimestamp: number;
  let quantity: number;

  if (!startTimestampRaw || !endTimestampRaw || !quantityRaw) {
    res.status(400);
    res.send("query parameters are missing");
    return;
  }

  try {
    startTimestamp = parseInt(startTimestampRaw as string);
    endTimestamp = parseInt(endTimestampRaw as string);
    quantity = parseInt(quantityRaw as string);
  } catch (e) {
    res.status(400);
    res.send("query parameters aren't numbers");
    return;
  }
  const timestampsLength = timestamps.length;
  const output = timestampSelection(timestamps, startTimestamp, endTimestamp, quantity);
  res.json(output)
})

app.post('/v1/get_timestamps', async function (req, res) {
  res.type('json')
  const params = req.query

  const startTimestampRaw = req.query.start_timestamp;
  const endTimestampRaw = req.query.end_timestamp;
  const quantityRaw = req.query.quantity;

  let startTimestamp: number;
  let endTimestamp: number;
  let quantity: number;

  if (!startTimestampRaw || !endTimestampRaw || !quantityRaw) {
    res.status(400);
    res.send("query parameters are missing");
    return;
  }
  try {
    // +s replaced with spaces for some reason I should
    // probs know
    const startTimeMoment = moment((startTimestampRaw as string).replace(" ", "+"))
    const endTimeMoment = moment((endTimestampRaw as string).replace(" ", "+"))
    startTimestamp = startTimeMoment.unix();
    endTimestamp = endTimeMoment.unix();
    quantity = parseInt(quantityRaw as string);
  } catch (e) {
    res.status(400);
    res.send("query parameters aren't valid ISO strings, failure in datetime parse");
    return;
  }

  const output = timestampSelection(timestamps, startTimestamp, endTimestamp, quantity);
  res.json(output)
})

app.listen(5001, function () {
  console.log('SERVER UP on 5001!');
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});