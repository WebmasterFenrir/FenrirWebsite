#!/bin/bash

# Configuration
IMAGE_NAME="fenrirwebsite"
CONTAINER_NAME="fenrirwebsite-container"
PORT=80

echo "Stopping existing container (if running)..."
docker stop $CONTAINER_NAME 2>/dev/null

echo "Removing existing container (if exists)..."
docker rm $CONTAINER_NAME 2>/dev/null

echo "Removing old image (if exists)..."
docker rmi $IMAGE_NAME 2>/dev/null

echo "Building new Docker image..."
docker build -t $IMAGE_NAME .

if [ $? -ne 0 ]; then
  echo "Image build failed. Exiting."
  exit 1
fi

echo "Running new container..."
docker run -d --name $CONTAINER_NAME -p $PORT:80 $IMAGE_NAME

echo "Deployment complete."
docker ps
