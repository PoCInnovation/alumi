import * as pulumi from '@pulumi/pulumi';
import type { ItemType } from '@aleph-sdk/message';
import { AuthenticatedAlephHttpClient } from '@aleph-sdk/client';
import {
  getAccount,
  hashData,
  getAlephExplorerUrl,
  getRawFileUrl,
} from './utils';

export interface StoreStringInputs {
  stringContent: pulumi.Input<string>;
  storageEngine: pulumi.Input<ItemType.ipfs | ItemType.storage>;
  channel: pulumi.Input<string>;
  accountEnvName: pulumi.Input<string>;
}

interface StoreStringProviderInputs {
  stringContent: string;
  storageEngine: ItemType.ipfs | ItemType.storage;
  channel: string;
  accountEnvName: string;
}

const propStringContent = 'stringContent';
const propStorageEngine = 'storageEngine';
const propChannel = 'channel';
const propAccountEnvName = 'accountEnvName';

export interface StoreStringOutputs {
  // inputs
  stringContent: string;
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
  string_content_hashed: string;
}

const StoreStringProvider: pulumi.dynamic.ResourceProvider = {
  async diff(
    id: string,
    olds: StoreStringOutputs,
    news: StoreStringProviderInputs
  ) {
    const replaces = [];

    if (olds[propChannel] !== news[propChannel]) {
      replaces.push(propChannel);
    }
    if (olds[propStorageEngine] !== news[propStorageEngine]) {
      replaces.push(propStorageEngine);
    }
    if (olds.string_content_hashed !== hashData(news[propStringContent])) {
      replaces.push(propStringContent);
    }
    if (replaces.length === 0) {
      return { changes: false };
    }
    return { replaces: replaces };
  },

  async update(id: string, olds: StoreStringOutputs, news: StoreStringInputs) {
    throw new Error('Cannot update StoreString; Only Delete And Created');
  },

  async delete(id: string, props: StoreStringOutputs) {
    const account = await getAccount(props[propAccountEnvName]);
    const client = new AuthenticatedAlephHttpClient(account);
    await client.forget({
      channel: props[propChannel],
      hashes: [props.item_hash],
      sync: true,
    });
  },

  async create(
    inputs: StoreStringProviderInputs
  ): Promise<pulumi.dynamic.CreateResult<StoreStringOutputs>> {
    const account = await getAccount(inputs[propAccountEnvName]);
    const client = new AuthenticatedAlephHttpClient(account);
    const stringBlob = new Blob([inputs[propStringContent]], {
      type: 'text/plain',
    });
    const stringHash = hashData(inputs[propStringContent]);
    const res = await client.createStore({
      channel: inputs[propChannel],
      fileObject: stringBlob,
      storageEngine: inputs[propStorageEngine],
      sync: true,
    });
    const out: StoreStringOutputs = {
      // inputs
      stringContent: inputs[propStringContent],
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
      string_content_hashed: stringHash,
    };
    return {
      id: `${account.address}-${res.item_hash}`,
      outs: out,
    };
  },

  async read(id: string, props: StoreStringOutputs) {
    const account = await getAccount(props[propAccountEnvName]);
    const client = new AuthenticatedAlephHttpClient(account);
    const res = await client.downloadFile(props.item_hash);
    const raw_file_url = getRawFileUrl(props.content_item_hash);
    props[propStringContent] = new TextDecoder().decode(res);
    props.string_content_hashed = hashData(props[propStringContent]);
    const out: StoreStringOutputs = {
      ...props,
      raw_file_url: raw_file_url,
    };
    return {
      id: id,
      outs: out,
    };
  },
};

export class StoreString extends pulumi.dynamic.Resource {
  // inputs
  public readonly stringContent!: pulumi.Output<string>;
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
  public readonly string_content_hashed!: pulumi.Output<string>;

  constructor(
    name: string,
    props: StoreStringInputs,
    opts?: pulumi.CustomResourceOptions
  ) {
    super(
      StoreStringProvider,
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
        string_content_hashed: undefined,
        ...props,
      },
      opts
    );
  }
}
