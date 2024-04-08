# Alumi - @pocinnovation/alumi

- Node Version: v20.11.1

## Resource

> [!IMPORTANT]
> Each resources need an `accountEnvName` variable that specify the environment variable name.
> This environment variable will be used to interact with aleph.

The format of this variable must be `PROVIDER_NAME:METHOD:VALUE`

| Provider  | Method     | Value        |
| --------- | ---------- | ------------ |
| AVALANCHE | PRIVATEKEY | `privatekey` |
| TEZOS     | PRIVATEKEY | `privatekey` |
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

```ts
import { Post } from "@pocinnovation/alumi";
import { ItemType } from "aleph-sdk-ts/dist/messages/types";

export const messageTest = new Post('messageTest', {
  content: {
    body: 'Hello world! (updated)',
    tags: 'Test',
  },
  postType: 'alumi-test',
  channel: 'pulumi-test-channel',
  accountEnvName: 'ETH_ACCOUNT_MNEMONIC',
  storageEngine: ItemType.inline,
  ref: '',
});
export const messageTestExplorer = messageTest.aleph_explorer_url;
```

<details>
<summary>Links</summary>

- [@aleph-sdk/message/src/post](https://github.com/aleph-im/aleph-sdk-ts/tree/main/packages/message/src/post)
- [@aleph-sdk/client/src/authenticatedHttpClient](https://github.com/aleph-im/aleph-sdk-ts/blob/main/packages/client/src/authenticatedHttpClient.ts)

</details>

### StoreString

Store a String as a File to aleph

```ts
import { StoreString } from "@pocinnovation/alumi";
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

<details>
<summary>Links</summary>

- [@aleph-sdk/message/src/store](https://github.com/aleph-im/aleph-sdk-ts/tree/main/packages/message/src/store)
- [@aleph-sdk/client/src/authenticatedHttpClient](https://github.com/aleph-im/aleph-sdk-ts/blob/main/packages/client/src/authenticatedHttpClient.ts)

</details>

### StoreFile

Store File to aleph

```ts
import { StoreFile } from "@pocinnovation/alumi";
import { ItemType } from "aleph-sdk-ts/dist/messages/types";

export const fileIndexJs = new StoreFile('indexJs', {
  filePath: './src/index.ts',
  channel: 'pulumi-test-channel',
  accountEnvName: 'ETH_ACCOUNT_MNEMONIC',
  storageEngine: ItemType.storage,
});
export const fileIndexUrl = fileIndexJs.raw_file_url;
```

<details>
<summary>Links</summary>

- [@aleph-sdk/message/src/store](https://github.com/aleph-im/aleph-sdk-ts/tree/main/packages/message/src/store)
- [@aleph-sdk/client/src/authenticatedHttpClient](https://github.com/aleph-im/aleph-sdk-ts/blob/main/packages/client/src/authenticatedHttpClient.ts)

</details>

### Aggregate

Store Key-Value pair

```ts
import { Aggregate } from "@pocinnovation/alumi";
import { ItemType } from "aleph-sdk-ts/dist/messages/types";

export const keyValue = new Aggregate('keyValue', {
  key: 'abc',
  content: {
    test: 'def',
    ooo: 'ooo',
  },
  channel: 'pulumi-test-channel',
  storageEngine: ItemType.inline,
  accountEnvName: 'ETH_ACCOUNT_MNEMONIC',
});
export const keyValueExplorer = keyValue.aleph_explorer_url;
```

<details>
<summary>Links</summary>

- [@aleph-sdk/message/src/aggregate](https://github.com/aleph-im/aleph-sdk-ts/tree/main/packages/message/src/aggregate)
- [@aleph-sdk/client/src/authenticatedHttpClient](https://github.com/aleph-im/aleph-sdk-ts/blob/main/packages/client/src/authenticatedHttpClient.ts)

</details>

### securityKey

It is wrapper around `Aggregate`

```ts
import { securityKey } from "@pocinnovation/alumi";
import { ItemType } from "aleph-sdk-ts/dist/messages/types";

export const secuKey = securityKey('key', {
  authorizations: [
    {
      address: process.env.ADDRESS_SECU_GIVE || '',
      types: ['POST'],
      post_types: ['alumi-test'],
      channels: ['pulumi-test-channel'],
    },
  ],
  storageEngine: ItemType.inline,
  accountEnvName: 'ETH_ACCOUNT_MNEMONIC',
});
export const secuKeyExplorer = secuKey.aleph_explorer_url;
```

<details>
<summary>Links</summary>

See also links from Aggregate.

</details>

### Program (Aleph VM)

```ts
program = new Program('program-basic', {
  channel: 'pulumi-test-channel',
  path: './basicprogram/main.py',
  entryPoint: 'main:app',
  memory: 128,
  runtime: getDefaultRuntime(),
  volumes: [],
  storageEngine: ItemType.storage,
  accountEnvName: 'ETH_ACC_PERSO',
});
programVmUrl = program.aleph_vm_url;
programExplorer = program.aleph_explorer_url;
```

<details>
<summary>Links</summary>

- [@aleph-sdk/message/src/program](https://github.com/aleph-im/aleph-sdk-ts/tree/main/packages/message/src/program)
- [@aleph-sdk/client/src/authenticatedHttpClient](https://github.com/aleph-im/aleph-sdk-ts/blob/main/packages/client/src/authenticatedHttpClient.ts)

</details>

### Instance

In development.

It is still beta.

Some code is present for when it will be possible.
