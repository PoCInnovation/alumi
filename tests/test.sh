#!/bin/bash

mkdir -p alumi-module
cp -r "../src" "./alumi-module"
cp "../package.json" "./alumi-module"
cp "../tsconfig.json" "./alumi-module"
cp "../package-lock.json" "./alumi-module"
cp -r "../dist" "./alumi-module"

cat > package.json << EOF
{
  "name": "test-module-aleph",
  "version": "0.0.1",
  "description": "test test",
  "main": "src/index.ts",
  "scripts": {
    "build": "tsc",
    "test": "echo run ./run-dev.sh and go in the repository 'tests'"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/PoCInnovation/alumi.git"
  },
  "keywords": [
    "Pulumi",
    "Dynamic-Provider",
    "Aleph",
    "Provider"
  ],
  "author": "PocInnovation",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/PoCInnovation/alumi/issues"
  },
  "homepage": "https://github.com/PoCInnovation/alumi#readme",
  "devDependencies": {
    "typescript": "^5.3.2"
  }
}
EOF

npm install
npm add "./alumi-module"

npm run build
npm run test
