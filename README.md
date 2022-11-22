Sydney Transit Graph
--------------------

Live at [sydneytransitgraph.com](https://sydneytransitgraph.com/)!

A visualisation of realtime Sydney bus congestion. Each line on the graph (a Marey chart) represents a bus completing its route (percentage) over time. Click on a line to highlight the position of that particular bus on the map. When the angle of the line is shallow, there is bus congestion. When the lines are bunched together, there is bus bunching.

Less bus congestion results in faster trip times, which in turn reduces labour costs, decreases bus headways (or reduces need for new buses) and improves passenger throughput.

# Contributing
I haven't done any serious work on this repo in a little while as I've been busy with life and
other side projects. Setting up the development env/infrastructure is not easy and the documentation is likely incomplete. It's not my best code!

Contributions very welcome, feel free to contact me at jake@jakecoppinger.com :)

# Tech stack
The web app is built with vanilla JS (TypeScript), p5.js for the graph, and Mapbox GL JS for the map (which uses OpenStreetMap data).

Data is sourced from Transport for NSW via OpenData. Realtime data is ingested every few seconds via an service running on AWS EC2 to store Protocol Buffer files on AWS S3.

When requested via an API, a service on AWS Lambda retrives these Protocol Buffer files and computes the trip progress and occupancy of every bus in a specified time window.

I adjustably quantise the number of Protocol Buffers requested (and thus the number of results) via looking up available timestamps.

Trip progress is calculated by comparing positions against bus route shapes. These route shapes have been precomputed from GTFS database dumps (via Sqlite) and stored on AWS S3 as JSON.

# Architecture
- Backend API is served from AWS Lambda (but can also run on any Linux server)
  - It lives in `src/app.ts`
- Route shapes are stored as JSON files in AWS S3
- Protocol Buffers of bus location data are stored on AWS S3
- Ingestion service runs on EC2

# Local develoment
## Install requirements
```
sudo apt update
sudo apt install sqlite3 unzip -y
# Install python2 with apt if necessary
```
## Install AWS CLI
- check if x86: `uname -a`
https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

```
sudo apt install unzip
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

## Deploying route data to S3
First we'll create a sqlite3 database and injest the GTFS routes, then generate route shapes as JSON
files and store them on S3.

### Creating database with routes, and then deplying to S3
- Download "GTFS Timetables Complete" zip from https://opendata.transport.nsw.gov.au/dataset/timetables-complete-gtfs
- Get it on your server using `rsync` or similar:
  ```
  rsync --progress ~/Downloads/full_greater_sydney_gtfs_static.zip transportstatus1:~/
  ```

### Create database and generate shapes

`sudo npm install -g csvtojson`

- get it in ~/repos/sydney-bus-visualisation/database/gtfs-files
- `unzip full_greater_sydney_gtfs_static.zip`
- goto `~/repos/sydney-bus-visualisation/database/`

```
./clean-boms.sh

./create-sql-database.sh # Update variables in this file # TODO: Add params
```

Generate the routes and shapes, this will take a little while:
- `./bash/generate-routes.sh`
- `./bash/generate-route-shapes.sh`

Sync the routes & shapes to S3:
- `./sync-routes-to-s3.sh`

## Setup config
- This repo is still a bit of a mess!
- Update config in `src/utils/config.ts` for your
- See Cloudflare SSL docuentation

## Location ingestion service
This can run on any low powered, always on service. This could be improved by being run as a
periodic AWS Lambda job.

Start the timestamp service (from root of repo):

`yarn && NODE_OPTIONS="--max-old-space-size=4096" yarn build && yarn run start-timestamp-service`

Start the AWS Uploader:

`yarn && NODE_OPTIONS="--max-old-space-size=4096" yarn build && yarn start-aws-uploader`

# Optional: Update the Lambda service

`yarn run deploy`
or
`NODE_OPTIONS="--max-old-space-size=4096" yarn run deploy`
`NODE_OPTIONS="--max-old-space-size=4096" yarn run deploy  --stage production`

## Backend on dev machine

`./scripts/watch-run-sever.sh`

## Watch tests (that rerun)

`./scripts/watch-test.sh`

## Set up frontend on dev machine

`cd frontend`
`yarn install`

## Copy the shared interface
`yarn build`

## Live watch changes
`yarn watch`

- Host server from `dist/` with Python:
  `python3 -m http.server`

# Testing

```
yarn test
```

# Cloudflare configuration
sydneytransitgraph.com is hosted on AWS Lmbda/S3/EC2 with the Cloudflare CDN in front of it.

These are some notes for setting up SSL certificates for HTTPS between them

- Set SSL to full on Cloudflare
- Add page rule to set sydneytransitgraph.com/* to flexible (for S3, Lambda needs full to work)

## Cloudflare certificates

- Add Serverless deployment URL to Cloudflare as CNAME
  - ***use domain from api gateway, not lambda domain!!***
- Create Cloudflare Origin cert: https://developers.cloudflare.com/ssl/origin-configuration/origin-ca
	- Create Certificate chain here: https://www.leanx.eu/tutorials/set-up-amazons-api-gateway-custom-domain-with-cloudflare
		- Rootca: https://developers.cloudflare.com/ssl/origin-configuration/origin-ca#4-required-for-some-add-cloudflare-origin-ca-root-certificates
		- https://developers.cloudflare.com/ssl/e2b9968022bf23b071d95229b5678452/origin_ca_rsa_root.pem
	- QandA: https://community.cloudflare.com/t/cant-get-certificate-chain/146593
- Create AWS Cert for domain:  https://ap-southeast-2.console.aws.amazon.com/acm/home?region=ap-southeast-2#/
	- Goto API Gateway -> Custom domain names
- Goto API mappings, map domain to lambda dev


## Utilities
### `node datalogger.js`
Gets latest data, saves into data/ if it doesn't exist yet.
Filename is timestamp.

### `./bufToJson.js filename`
Outputs protol buffer file as JSON

### `./datalogger.js`
Saves every broardcast to a file

# Other documentation
TfNSW API Details and other notes
https://opendata.transport.nsw.gov.au/node/330/exploreapi

## Protocol Buffers spec
https://developers.google.com/protocol-buffers/docs/encoding

## GTFS Realtime Protobuff
The spec to parse binary protocol buffers
https://developers.google.com/transit/gtfs-realtime/gtfs-realtime-proto

## GTFs sql importer
https://github.com/cbick/gtfs_SQL_importer

# License

[GNU Affero General Public License v3.0](https://choosealicense.com/licenses/agpl-3.0/). See LICENSE.

# Author
Jake Coppinger ([jakecoppinger.com](https://jakecoppinger.com)).

Contact at [jake@jakecoppinger.com](mailto:jake@jakecoppinger.com).