# Alumi - pulumi-dynamic-provider-aleph

## Resource

> [!IMPORTANT]
> Each resources need an `accountEnvName` variable that specify the environment variable name.
> This environment variable will be used to interact with aleph.

The format of this variable must be `PROVIDER_NAME:METHOD:VALUE`

| Provider  | Method     | Value        |
| --------- | ---------- | ------------ |
| AVALANCHE | PRIVATEKEY | `privatekey` |
| ETHERUM   | MNEMONIK   | `passphrase` |
| ETHERUM   | PRIVATEKEY | `privatekey` |
| COSMOS    | MNEMONIK   | `passphrase` |
| COSMOS    | PRIVATEKEY | `privatekey` |
| NULS2     | MNEMONIK   | `passphrase` |
| NULS2     | PRIVATEKEY | `privatekey` |
| SUBSTRATE | MNEMONIK   | `passphrase` |
| SUBSTRATE | PRIVATEKEY | `privatekey` |

> [!NOTE]
> Only ETHERUM with MNEMONIK has been tested.

### StoreString

Store a string as file to aleph

```ts
import { StoreString } from "pulumi-dynamic-provider-aleph";
import { ItemType } from "aleph-sdk-ts/dist/messages/types";

export const stringStored = StoreString("stringStored", {
    stringContent: "Hello World",
    stringContentMimeType: "text/plain",
    storageEngine: ItemType.storage,
    channel: "pulumi-test-channel",
    accountEnvName: "ETH_ACCOUNT_MNEMONIC",
});
export const stringStoredUrl = stringStored.raw_file_url;
```

### storeFile

It is a wrapper around `StoreString`

```ts
import { storeFile } from "pulumi-dynamic-provider-aleph";
import { ItemType } from "aleph-sdk-ts/dist/messages/types";

export const fileStored = storeFile("fileStored", {
    filePath: "./path/to/my/file.js",
    channel: "pulumi-test-channel",
    accountEnvName: "ETH_ACCOUNT_MNEMONIC",
    storageEngine: ItemType.storage,
});
export const fileStoredUrl = fileStored.raw_file_url;
```
