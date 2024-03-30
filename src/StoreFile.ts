import * as pulumi from '@pulumi/pulumi';
import type { ItemType } from '@aleph-sdk/message';
import { AuthenticatedAlephHttpClient } from '@aleph-sdk/client';
import { readFileSync } from 'fs';
import { getAccount, hashData, getAlephExplorerUrl, getRawFileUrl } from './utils';

export interface StoreFileInputs {
  filePath: pulumi.Input<string>;
  storageEngine: pulumi.Input<ItemType.ipfs | ItemType.storage>;
  channel: pulumi.Input<string>;
  accountEnvName: pulumi.Input<string>;
}

interface StoreFileProviderInputs {
  filePath: string;
  storageEngine: ItemType.ipfs | ItemType.storage;
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
  storageEngine: ItemType.ipfs | ItemType.storage;
  accountEnvName: string;
  // outputs
  signature: string;
  chain: string;
  sender: string;
  type: string;
  channel: string;
  time: number;
  item_type: string;
  item_hash: string;
  // Created
  content_address: string;
  content_item_type: string;
  content_item_hash: string;
  content_time: number;
  aleph_explorer_url: string;
  raw_file_url: string;
  file_content_hashed: string;
}

const StoreFileProvider: pulumi.dynamic.ResourceProvider = {
  async diff(
    id: string,
    olds: StoreFileOutputs,
    news: StoreFileProviderInputs
  ) {
    const replaces = [];

    if (olds[propChannel] !== news[propChannel]) {
      replaces.push(propChannel);
    }
    if (olds[propStorageEngine] !== news[propStorageEngine]) {
      replaces.push(propStorageEngine);
    }
    if (
      olds.file_content_hashed !== hashData(readFileSync(news[propFilePath]))
    ) {
      replaces.push(propFilePath);
    }
    if (replaces.length === 0) {
      return { changes: false };
    }
    return { replaces: replaces };
  },

  async update(id: string, olds: StoreFileOutputs, news: StoreFileInputs) {
    throw new Error('Cannot update StoreFile; Only Delete And Created');
  },

  async delete(id: string, props: StoreFileOutputs) {
    const account = await getAccount(props[propAccountEnvName]);
    const client = new AuthenticatedAlephHttpClient(account);
    await client.forget({
      channel: props[propChannel],
      hashes: [props.item_hash],
      sync: true,
    });
  },

  async create(
    inputs: StoreFileProviderInputs
  ): Promise<pulumi.dynamic.CreateResult<StoreFileOutputs>> {
    const account = await getAccount(inputs[propAccountEnvName]);
    const client = new AuthenticatedAlephHttpClient(account);
    const fileBuffer = readFileSync(inputs[propFilePath]);
    const stringHash = hashData(fileBuffer);
    const res = await client.createStore({
      channel: inputs[propChannel],
      fileObject: fileBuffer,
      storageEngine: inputs[propStorageEngine],
      sync: true,
    });
    const out: StoreFileOutputs = {
      // inputs
      filePath: inputs[propFilePath],
      storageEngine: inputs[propStorageEngine],
      accountEnvName: inputs[propAccountEnvName],
      // outputs
      channel: res.channel || '',
      signature: res.signature,
      chain: res.chain,
      sender: res.sender,
      type: `${res.type}`,
      time: res.time,
      item_type: res.item_type,
      item_hash: res.item_hash,
      // Created
      content_address: res.content.address,
      content_item_type: res.content.item_type,
      content_item_hash: res.content.item_hash,
      content_time: res.content.time,
      aleph_explorer_url: getAlephExplorerUrl(
        res.chain,
        res.sender,
        'STORE',
        res.item_hash
      ),
      raw_file_url: getRawFileUrl(res.content.item_hash),
      file_content_hashed: stringHash,
    };
    return {
      id: `${account.address}-${res.item_hash}`,
      outs: out,
    };
  },

  async read(id: string, props: StoreFileOutputs) {
    const account = await getAccount(props[propAccountEnvName]);
    const client = new AuthenticatedAlephHttpClient(account);
    const res = await client.downloadFile(props.item_hash);
    const raw_file_url = getRawFileUrl(props.content_item_hash);
    const fileBuffer = Buffer.from(res);
    props.file_content_hashed = hashData(fileBuffer);
    const out: StoreFileOutputs = {
      ...props,
      raw_file_url: raw_file_url,
    };
    return {
      id: id,
      outs: out,
    };
  },
};

export class StoreFile extends pulumi.dynamic.Resource {
  // inputs
  public readonly filePath!: pulumi.Output<string>;
  public readonly storageEngine!: pulumi.Output<string>;
  public readonly accountEnvName!: pulumi.Output<string>;
  // outputs
  public readonly signature!: pulumi.Output<string>;
  public readonly chain!: pulumi.Output<string>;
  public readonly sender!: pulumi.Output<string>;
  public readonly type!: pulumi.Output<string>;
  public readonly channel!: pulumi.Output<string>;
  public readonly time!: pulumi.Output<number>;
  public readonly item_type!: pulumi.Output<string>;
  public readonly item_hash!: pulumi.Output<string>;
  // Created
  public readonly content_address!: pulumi.Output<string>;
  public readonly content_item_type!: pulumi.Output<string>;
  public readonly content_item_hash!: pulumi.Output<string>;
  public readonly content_item_time!: pulumi.Output<string>;
  public readonly aleph_explorer_url!: pulumi.Output<string>;
  public readonly raw_file_url!: pulumi.Output<string>;
  public readonly file_content_hashed!: pulumi.Output<string>;

  constructor(
    name: string,
    props: StoreFileInputs,
    opts?: pulumi.CustomResourceOptions
  ) {
    super(
      StoreFileProvider,
      name,
      {
        signature: undefined,
        chain: undefined,
        sender: undefined,
        type: undefined,
        time: undefined,
        item_type: undefined,
        item_hash: undefined,
        content_address: undefined,
        content_item_type: undefined,
        content_item_hash: undefined,
        content_time: undefined,
        aleph_explorer_url: undefined,
        raw_file_url: undefined,
        file_content_hashed: undefined,
        ...props,
      },
      opts
    );
  }
}
