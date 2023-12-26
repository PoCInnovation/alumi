import { basicTest, BasicTest, Message } from "pulumi-dynamic-provider-aleph";
import { ItemType } from "aleph-sdk-ts/dist/messages/types";
import * as pulumi from "@pulumi/pulumi";


console.log("test!");
basicTest();

export const basicRes = new BasicTest("abc", { foo: "barbaz"});
export const basicResLenName = basicRes.lenName;

export const message = new Message("first-message", {
    content: {
        body: "hello from pulumi - edit - edit too"
    },
    postType: "pulumi-test-type",
    channel: "pulumi-test-channel",
    storageEngine: ItemType.inline,
});
export const alephExporerUrl = message.aleph_explorer_url;
