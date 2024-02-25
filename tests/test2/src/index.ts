import { Post, PostProviderOutputs } from "pulumi-dynamic-provider-aleph";
import { ItemType } from "aleph-sdk-ts/dist/messages/types";
import * as pulumi from "@pulumi/pulumi";

if (process.env.ACCOUNT_MNEMONIC === undefined) {
    throw new Error("ACCOUNT_MNEMONIC is undefined; copy content of file ./env.copy in your terminal");
}
if (process.env.DELEGATE_ADDRESS === undefined) {
    throw new Error("DELEGATE_ADDRESS is undefined; copy content of file ./env.copy in your terminal");
}
if (process.env.STACK_REF_NAME === undefined) {
    throw new Error("STACK_REF_NAME is undefined; set it to be '<organization>/<project>/<stack>'; for exemple: pocinnovation/alumi/dev");
}

const stackRef = new pulumi.StackReference(process.env.STACK_REF_NAME);
export const lastMessageEditable = stackRef.getOutput("messageEditable");

export const messageEditable = new Post("message1-edit", {
    content: {
        body: "This post has been edited",
    },
    postType: "amend",
    channel: "pulumi-test-channel",
    storageEngine: ItemType.inline,
    // @ts-ignore
    ref: lastMessageEditable.item_hash,
});
export const messageEditableExplorer = messageEditable.aleph_explorer_url;
