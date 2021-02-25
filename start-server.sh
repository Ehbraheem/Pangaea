#!/bin/bash 
set -euo pipefail

if (ps aux | grep redis | grep -v grep > /dev/null)
  then
      continue
  else
      echo "You need redis-server running to start the apps.";
      exit;
  fi

# Start subscriber in the background
pushd packages/subscriber 
yarn start &
popd

pushd packages/publisher
yarn start

trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT
