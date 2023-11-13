#!/bin/bash

CRI=""
if command -v docker >/dev/null 2>&1; then
    CRI="docker"
elif command -v podman >/dev/null 2>&1; then
    CRI="podman"
else
    echo "docker or podman is not installed"
    exit 1
fi

$CRI build -t pocinnovation/alumi:latest .
$CRI run -it --rm -v $(pwd):/code --workdir /code pocinnovation/alumi
