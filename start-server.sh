#!/bin/bash 
set -euo pipefail

# Start subscriber in the background
pushd packages/subscriber 
yarn start &
popd

pushd packages/publisher
yarn start

trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT
