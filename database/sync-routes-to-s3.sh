#!/usr/bin/env bash

aws s3 sync dist/ s3://routes.sydneytransitgraph.com/ --delete
# aws s3 sync dist/ s3://sydneytransitservice-routes/ --delete
