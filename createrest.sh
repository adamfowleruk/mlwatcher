#!/bin/sh
curl --anyauth --user admin:admin -X POST \
-d '{"rest-api": {"name": "mljsrest-modules-deploy", "database": "mljsrest-modules","modules-database": "mljsrest-modules","port": "8124"}}' \
-H "Content-type: application/json" \
  http://192.168.123.201:8002/v1/rest-apis
