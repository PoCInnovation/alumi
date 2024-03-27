import { Post, storeFile, Aggregate, securityKey, Program, getDefaultRuntime } from "pulumi-dynamic-provider-aleph";
import { ItemType } from "@aleph-sdk/message";
import * as pulumi from "@pulumi/pulumi";

export const messageTest = new Post("messageTest", {
    content: {
        body: "Hello world! (updated)",
        tags: "Test",
    },
    postType: "alumi-test",
    channel: "pulumi-test-channel",
    accountEnvName: "ETH_ACCOUNT_MNEMONIC",
    storageEngine: ItemType.inline,
    ref: "",
});
export const messageTestExplorer = messageTest.aleph_explorer_url;

export const fileIndexJs = storeFile("indexJs", {
    filePath: "./src/index.ts",
    channel: "pulumi-test-channel",
    accountEnvName: "ETH_ACCOUNT_MNEMONIC",
    storageEngine: ItemType.storage,
});
export const fileIndexUrl = fileIndexJs.raw_file_url;

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

let program: any = undefined;
let programVmUrl: any = undefined;
let programExplorer: any = undefined;
if (process.env.ETH_ACC_PERSO !== undefined) {
    program = new Program("program-basic", {
        channel: "pulumi-test-channel",
        path: "./basicprogram/main.py",
        entryPoint: "main:app",
        memory: 128,
        runtime: getDefaultRuntime(),
        volumes: [],
        storageEngine: ItemType.storage,
        accountEnvName: "ETH_ACC_PERSO",
    });
    programVmUrl = program.aleph_vm_url;
    programExplorer = program.aleph_explorer_url;
}

export const exportProgram = program;
export const exportProgramVmUrl = programVmUrl;
export const exportProgramExplorer = programExplorer;
