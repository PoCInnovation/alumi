#!/bin/bash

rm -rf alumi-module
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
    "typescript": "^5.3.2",
    "ts-node": "^10.9.2"
  }
}
EOF

npm install
npm add "./alumi-module"

echo "## Please export env variable like this:"
echo "export ETH_ACCOUNT_MNEMONIC='ETHERUM:MNEMONIK:love velvet doctor enough general tail orphan ivory skirt wait athlete enforce'"
echo "export ADDRESS_SECU_GIVE='0x43dd0431e8869f126F015518874185bf069cEa18'"
echo "## If you want to test program messages (aleph vm):"
echo "export ETH_ACC_PERSO='ETHERUM:MNEMONIK:<insert-here-your-mnemonic>'"
