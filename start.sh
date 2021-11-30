#!/bin/bash

IP_ADDRESS=$(cat .env | grep ip_address | sed 's/ip_address=//g' | sed 's/"//g')
if [[ $IP_ADDRESS  ]]; then
  echo "Reading IP Address: $IP_ADDRESS"
else
  echo "IP Address not provided"
  exit 1
fi

DIR_NAME=$(cat .env | grep dir_name | sed 's/dir_name=//g' | sed 's/"//g')
echo "Reading working directory: " $DIR_NAME

if test -f "$DIR_NAME/config.json"; then
  echo "File config.json exists."
else
  echo "Creating empty config.json file"
  echo "{}" > config.json
fi
echo ""

./stop.sh


echo "Building the Indy-node docker images"
./von-network/manage build > /dev/null || ./von-network/manage build
echo "Startin the local Indy network"
./von-network/manage up $IP_ADDRESS
echo ""
echo "Waiting 30 seconds until the Indy network is running"
sleep 30
echo ""

echo "Building the remaining components  -- this can take around a minute"
docker-compose build -q || docker-compose build

echo "Starting all Aries Cloudagents"
docker-compose up -d msp1-agent msp2-agent issuer-agent verifier-agent
echo ""
echo "Waiting 10 seconds until the Aries Cloudagents are running"
sleep 10
echo ""

echo "Starting remaining components"
docker-compose up -d