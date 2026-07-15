#!/bin/sh
set -e

node dist/scripts/docker-seed.js
exec node dist/server.js
