import { Message } from "pulumi-dynamic-provider-aleph";
import { ItemType } from "aleph-sdk-ts/dist/messages/types";
import * as pulumi from "@pulumi/pulumi";


export const message = new Message("first-message", {
    content: {
        body: "hello from pulumi - edit - edit too - but one more is fine ?"
    },
    postType: "pulumi-test-type",
    channel: "pulumi-test-channel",
    storageEngine: ItemType.inline,
});
export const alephExporerUrl = message.aleph_explorer_url;

export const message2 = new Message("second-message", {
    content: {
        body: "second test just here"
    },
    postType: "pulumi-test-type",
    channel: "pulumi-test-channel",
    storageEngine: ItemType.inline,
})
export const alephExporerUrl2 = message2.aleph_explorer_url;
