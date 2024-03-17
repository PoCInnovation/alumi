import * as pulumi from '@pulumi/pulumi';
import type { ItemType } from 'aleph-sdk-ts/dist/messages/types/base.d.ts';
import { Publish as publishStore } from 'aleph-sdk-ts/dist/messages/store';
import { Publish as publishForget } from 'aleph-sdk-ts/dist/messages/forget';
import { Get as getStore } from 'aleph-sdk-ts/dist/messages/store';
import { readFileSync } from "fs";
import { getAccount } from "./utils";

export interface StoreFileInputs {
  filePath: pulumi.Input<string>;
  storageEngine: pulumi.Input<ItemType>;
  channel: pulumi.Input<string>;
  accountEnvName: pulumi.Input<string>;
}

interface StoreFileProviderInputs {
  filePath: string;
  storageEngine: ItemType;
  channel: string;
  accountEnvName: string;
}

const propFilePath = 'filePath';
const propStorageEngine = 'storageEngine';
const propChannel = 'channel';
const propAccountEnvName = 'accountEnvName';

export interface StoreFileOutputs {
  // inputs
  filePath: string;
  storageEngine: ItemType;
  accountEnvName: string;
  // outputs
  signature: string;
  chain: string;
  sender: string;
  type: string;
  channel: string;
  confirmed: boolean;
  time: number;
  size: number;
  item_type: string;
  item_content: string;
  item_hash: string;
  content: {
    address: string,
    item_type: string,
    item_hash: string,
    time: number,
  };
  // Created
  aleph_explorer_url: string;
  raw_file_url: string;
};

const StoreFileProvider: pulumi.dynamic.ResourceProvider = {
  async diff(id: string, olds: StoreFileOutputs, news: StoreFileInputs) {
    // TODO
    return { deleteAndReplace: true };
  },

  async update(id: string, olds: StoreFileOutputs, news: StoreFileInputs) {
    // TODO
  },

  async delete(id: string, props: StoreFileOutputs) {
    const account = getAccount(process.env[props[propAccountEnvName]]);
    await publishForget({
      account: account,
      channel: props[propChannel],
      hashes: [props.item_hash]
    });
  },

  async create(inputs: StoreFileInputs): Promise<pulumi.dynamic.CreateResult<StoreFileOutputs>> {
    const account = getAccount(process.env[props[propAccountEnvName]]);
    const fileContent = readFileSync(inputs[propFilePath]);
    const res = await publishStore({
      account: account,
      channel: inputs[propChannel],
      fileObject: fileContent,
      storageEngine: inputs[propStorageEngine],
    });
    const out: StoreFileOutputs = {
      ...inputs,
      ...res,
      aleph_explorer_url: encodeURI(`https://explorer.aleph.im/address/${res.chain}/${res.sender}/message/${res.type}/${res.item_hash}`),
      raw_file_url: encodeURI(`https://api2.aleph.im/api/v0/storage/raw/${res.item_hash}`),
    };
    return {
      id: `${account.address}-${res.item_hash}`,
      outs: out,
    };
  },

  async read(id: string, props: StoreFileOutputs) {
    const res = getStore({
      fileHash: props.item_hash,
    });
    const out: StoreFileOutputs = {
      ...props,
      ...res,
      aleph_explorer_url: encodeURI(`https://explorer.aleph.im/address/${res.chain}/${res.sender}/message/${res.type}/${res.item_hash}`),
      raw_file_url: encodeURI(`https://api2.aleph.im/api/v0/storage/raw/${res.item_hash}`),
    };
  }
}

export class StoreFile extends pulumi.dynamic.Resource {
  public readonly signature!: pulumi.Output<string>;
  public readonly chain!: pulumi.Output<string>;
  public readonly sender!: pulumi.Output<string>;
  public readonly type!: pulumi.Output<string>;
  public readonly channel!: pulumi.Output<string>;
  public readonly confirmed!: pulumi.Output<boolean>;
  public readonly time!: pulumi.Output<number>;
  public readonly size!: pulumi.Output<number>;
  public readonly item_type!: pulumi.Output<string>;
  public readonly item_content!: pulumi.Output<string>;
  public readonly item_hash!: pulumi.Output<string>;

  constructor(name: string, props: StoreFileInputs, opts?: pulumi.CustomResourceOptions) {
    super(
      StoreFileProvider,
      name,
      {
        ...props
        signature: undefined,
        chain: undefined,
        sender: undefined,
        type: undefined,
        channel: undefined,
        confirmed: undefined,
        time: undefined,
        size: undefined,
        item_type: undefined,
        item_content: undefined,
        item_hash: undefined,
      },
      opts
    );
  }
}
