#!/usr/bin/env bash
set -e

echo "Starting sync.."

aws s3 sync ./data/ s3://sydney-bus-visualisation/timestamps/

echo "Done"
