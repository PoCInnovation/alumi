import { Post, securityKey,  } from "pulumi-dynamic-provider-aleph";
import { ItemType } from "aleph-sdk-ts/dist/messages/types";
import * as pulumi from "@pulumi/pulumi";

if (process.env.ACCOUNT_MNEMONIC === undefined) {
    throw new Error("ACCOUNT_MNEMONIC is undefined; copy content of file ./env.copy in your terminal");
}
if (process.env.ACCOUNT_EDITOR_ADDRESS === undefined) {
    throw new Error("ACCOUNT_EDITOR_ADDRESS is undefined; copy content of file ./env.copy in your terminal");
}

export const key = securityKey("pulumi-test-key", {
    address: process.env.ACCOUNT_EDITOR_ADDRESS,
    types: ["POST"],
    postTypes: ["only-this-posttype-is-editable"],
    aggregateKeys: [],
    chains: [],
    channels: [],
});

export const messageEditable = new Post("message1", {
    content: {
        body: "Hello, this post is editable for accountEditor",
    },
    postType: "only-this-posttype-is-editable",
    channel: "pulumi-test-channel",
    storageEngine: ItemType.inline,
    ref: "",
});
export const messageEditableExplorer = messageEditable.aleph_explorer_url;

export const messageNotEditable = new Post("message2", {
    content: {
        body: "Hello, this post is not editable for accountEditor because the postType is not the same as the delegate security",
    },
    postType: "pulumi-test-type",
    channel: "pulumi-test-channel",
    storageEngine: ItemType.inline,
    ref: "",
});
export const messageNotEditableExplorer = messageNotEditable.aleph_explorer_url;
