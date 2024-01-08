#!/bin/bash

if [[ "$1" == "help" ]] || [[ "$1" == "--help" ]]; then
    echo "Usage: $0 [--help]"
    echo "Description: Build and run Alumi development container"
    exit 0
fi

CRI=""
if command -v docker >/dev/null 2>&1; then
    CRI="sudo docker"
elif command -v podman >/dev/null 2>&1; then
    CRI="podman"
else
    echo "docker or podman is not installed"
    exit 1
fi

$CRI build -t pocinnovation/alumi:latest .
$CRI run -it --rm -v $(pwd):/code --workdir /code pocinnovation/alumi
