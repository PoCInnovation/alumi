# Alumi - pulumi-dynamic-provider-aleph

- Node Version: v20.11.1

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

### Post

Post content to aleph

Aleph docs: <https://aleph-im.gitbook.io/ts-sdk/quick-start/message-types/post>

```ts
import { Post } from "pulumi-dynamic-provider-aleph";
import { ItemType } from "aleph-sdk-ts/dist/messages/types";

export const messageTest = new Post("messageTest", {
    content: {
        body: "Hello world!",
        tags: "Test",
    },
    postType: "alumi-test",
    channel: "pulumi-test-channel",
    accountEnvName: "ETH_ACCOUNT_MNEMONIC",
    storageEngine: ItemType.inline,
    ref: "",
});
export const messageTestExplorer = messageTest.aleph_explorer_url;
```

### StoreString

Store a string as file to aleph

Aleph docs: <https://aleph-im.gitbook.io/ts-sdk/quick-start/message-types/store>

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

Aleph docs: <https://aleph-im.gitbook.io/ts-sdk/quick-start/message-types/store>

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

### Aggregate

Store Key-Value pair

Aleph docs: <https://aleph-im.gitbook.io/ts-sdk/quick-start/message-types/aggregate>

```ts
import { Aggregate } from "pulumi-dynamic-provider-aleph";
import { ItemType } from "aleph-sdk-ts/dist/messages/types";

export const keyValue = new Aggregate("keyValue", {
    key: "abc",
    content: {
        "test": "def",
        "ooo": "ooo",
    },
    channel: "pulumi-test-channel",
    storageEngine: ItemType.inline,
    accountEnvName: "ETH_ACCOUNT_MNEMONIC",
});
export const keyValueExplorer = keyValue.aleph_explorer_url;
```

### securityKey

It is wrapper around `Aggregate`

Aleph docs: <https://aleph-im.gitbook.io/ts-sdk/quick-start/message-types/aggregate/security-key>

```ts
import { securityKey } from "pulumi-dynamic-provider-aleph";
import { ItemType } from "aleph-sdk-ts/dist/messages/types";

export const secuKey = securityKey("key", {
    authorizations: [
        {
            address: process.env.ADDRESS_SECU_GIVE,
            types: ['POST'],
            post_types: ['alumi-test'],
            channels: ['pulumi-test-channel'],
        },
    ],
    storageEngine: ItemType.inline,
    accountEnvName: "ETH_ACCOUNT_MNEMONIC",
});
export const secuKeyExplorer = secuKey.aleph_explorer_url;
```
