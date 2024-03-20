import { Post, storeFile } from "pulumi-dynamic-provider-aleph";
import { ItemType } from "aleph-sdk-ts/dist/messages/types";
import * as pulumi from "@pulumi/pulumi";

// export const message1 = new Post("message1", {
//     content: {
//         body: "Bonjour je suis un test!",
//     },
//     postType: "type-de-post",
//     channel: "pulumi-test-channel",
//     storageEngine: ItemType.inline,
//     ref: "",
// });
// export const message1Explorer = messageEditable.aleph_explorer_url;

export const fileIndexJs = storeFile("indexJs", {
    filePath: "./src/index.ts",
    channel: "pulumi-test-channel",
    accountEnvName: "ETH_ACCOUNT_MNEMONIC",
    storageEngine: ItemType.storage,
});
export const fileIndexUrl = fileIndexJs.raw_file_url;
