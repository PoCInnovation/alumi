import {
  Post,
  StoreFile,
  Aggregate,
  securityKey,
  Program,
  getDefaultRuntime,
  Instance,
  getDefaultImage,
} from '@pocinnovation/alumi';
import { ItemType } from '@aleph-sdk/message';
import * as pulumi from '@pulumi/pulumi';
import { readFileSync } from 'fs';

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

export const fileIndexJs = new StoreFile('indexJs', {
  filePath: './src/index.ts',
  channel: 'pulumi-test-channel',
  accountEnvName: 'ETH_ACCOUNT_MNEMONIC',
  storageEngine: ItemType.storage,
});
export const fileIndexUrl = fileIndexJs.raw_file_url;

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

let program: any = undefined;
let programVmUrl: any = undefined;
let programExplorer: any = undefined;
if (process.env.ETH_ACC_PERSO !== undefined) {
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
}
export const exportProgram = program;
export const exportProgramVmUrl = programVmUrl;
export const exportProgramExplorer = programExplorer;

// TODO: Fix?
// let instance: any = undefined;
// let instanceExplorer: any = undefined;
// if (process.env.ETH_ACC_PERSO !== undefined) {
//   // this path is used in the dockerfile
//   const filePath = '/root/.ssh/id_ed25519.pub'
//   const fileContent = readFileSync(filePath, 'utf8');
//   instance = new Instance('instance-basic', {
//     channel: 'pulumi-test-channel',
//     memory: 128,
//     image: getDefaultImage(),
//     volumes: [],
//     storageEngine: ItemType.storage,
//     accountEnvName: 'ETH_ACC_PERSO',
//     authorizedKeys: [fileContent],
//   });
//   instanceExplorer = instance.aleph_explorer_url;
// }
// export const exportInstance = instance;
// export const exportInstanceExplorer = instanceExplorer;
