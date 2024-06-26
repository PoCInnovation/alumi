import * as pulumi from '@pulumi/pulumi';
import type { ItemType } from '@aleph-sdk/message';
import { AuthenticatedAlephHttpClient } from '@aleph-sdk/client';
import { getAccount, getAlephExplorerUrl } from './utils';
import type { JSONDict } from './types';

export interface AggregateInputs {
  key: pulumi.Input<string>;
  content: pulumi.Input<JSONDict>;
  channel: pulumi.Input<string>;
  storageEngine: pulumi.Input<ItemType>;
  accountEnvName: pulumi.Input<string>;
}

interface AggregateProviderInputs {
  key: string;
  content: JSONDict;
  channel: string;
  storageEngine: ItemType;
  accountEnvName: string;
}

const propKey = 'key';
const propContent = 'content';
const propChannel = 'channel';
const propStorageEngine = 'storageEngine';
const propAccountEnvName = 'accountEnvName';

export interface AggregateOutputs {
  // inputs
  key: string;
  content: JSONDict;
  storageEngine: ItemType;
  accountEnvName: string;
  // outputs
  chain: string;
  channel: string;
  sender: string;
  type: string;
  signature: string;
  time: number;
  item_type: string;
  item_hash: string;
  // Created
  content_address: string;
  content_key: string;
  content_time: number;
  content_content: JSONDict;
  aleph_explorer_url: string;
}

const AggregateProvider: pulumi.dynamic.ResourceProvider = {
  async diff(
    id: string,
    olds: AggregateOutputs,
    news: AggregateProviderInputs
  ) {
    const replaces = [];
    const changes = [];

    if (
      JSON.stringify(olds[propContent]) !== JSON.stringify(news[propContent])
    ) {
      changes.push(propContent);
    }
    if (olds[propChannel] !== news[propChannel]) {
      replaces.push(propChannel);
    }
    if (olds[propStorageEngine] !== news[propStorageEngine]) {
      replaces.push(propStorageEngine);
    }
    if (olds[propKey] !== news[propKey]) {
      replaces.push(propKey);
    }

    if (replaces.length > 0) {
      return { replaces: replaces };
    } else if (changes.length > 0) {
      return { changes: true };
    } else {
      return { changes: false };
    }
  },

  async update(
    id: string,
    olds: AggregateOutputs,
    news: AggregateProviderInputs
  ) {
    const inputs = {
      key: news[propKey],
      content: news[propContent],
      channel: news[propChannel],
      storageEngine: news[propStorageEngine],
      accountEnvName: news[propAccountEnvName],
    };
    return await this.create(inputs);
  },

  async delete(id: string, props: AggregateOutputs) {
    const account = await getAccount(props[propAccountEnvName]);
    const client = new AuthenticatedAlephHttpClient(account);
    await client.forget({
      channel: props[propChannel],
      hashes: [props.item_hash],
      sync: true,
    });
  },

  async create(
    inputs: AggregateProviderInputs
  ): Promise<pulumi.dynamic.CreateResult<AggregateOutputs>> {
    const account = await getAccount(inputs[propAccountEnvName]);
    const client = new AuthenticatedAlephHttpClient(account);
    const res = await client.createAggregate({
      address: account.address,
      key: inputs[propKey],
      content: inputs[propContent],
      channel: inputs[propChannel],
      storageEngine: inputs[propStorageEngine],
      sync: true,
    });

    const out: AggregateOutputs = {
      // inputs
      key: inputs[propKey],
      content: inputs[propContent],
      storageEngine: inputs[propStorageEngine],
      accountEnvName: inputs[propAccountEnvName],
      // outputs
      chain: res.chain,
      channel: res.channel || '',
      sender: res.sender,
      type: `${res.type}`,
      signature: res.signature,
      time: res.time,
      item_type: res.item_type,
      item_hash: res.item_hash,
      // Created
      content_address: res.content.address,
      content_key: res.content.key.toString(),
      content_time: res.content.time,
      content_content: res.content.content,
      aleph_explorer_url: getAlephExplorerUrl(
        res.chain,
        res.sender,
        'AGGREGATE',
        res.item_hash
      ),
    };

    return {
      id: `${account.address}-${res.item_hash}`,
      outs: out,
    };
  },

  async read(id: string, props: AggregateOutputs) {
    const account = await getAccount(props[propAccountEnvName]);
    const client = new AuthenticatedAlephHttpClient(account);
    const res: JSONDict = await client.fetchAggregate(
      account.address,
      props[propKey]
    );

    if (res[props[propKey]] === null || res[props[propKey]] === undefined) {
      throw new Error('Aggregate not found');
    }

    const out: AggregateOutputs = {
      ...props,
      content_content: res,
    };

    return {
      id: id,
      outs: out,
    };
  },
};

export class Aggregate extends pulumi.dynamic.Resource {
  // inputs
  key!: pulumi.Output<string>;
  content!: pulumi.Output<JSONDict>;
  storageEngine!: pulumi.Output<ItemType>;
  accountEnvName!: pulumi.Output<string>;
  // outputs
  chain!: pulumi.Output<string>;
  channel!: pulumi.Output<string>;
  sender!: pulumi.Output<string>;
  type!: pulumi.Output<string>;
  signature!: pulumi.Output<string>;
  time!: pulumi.Output<number>;
  item_type!: pulumi.Output<string>;
  item_hash!: pulumi.Output<string>;
  // Created
  content_address!: pulumi.Output<string>;
  content_key!: pulumi.Output<string>;
  content_time!: pulumi.Output<number>;
  content_content!: pulumi.Output<JSONDict>;
  aleph_explorer_url!: pulumi.Output<string>;

  constructor(
    name: string,
    props: AggregateInputs,
    opts?: pulumi.CustomResourceOptions
  ) {
    super(
      AggregateProvider,
      name,
      {
        // outputs
        chain: undefined,
        sender: undefined,
        type: undefined,
        signature: undefined,
        time: undefined,
        item_type: undefined,
        item_hash: undefined,
        // Created
        content_address: undefined,
        content_key: undefined,
        content_time: undefined,
        content_content: undefined,
        aleph_explorer_url: undefined,
        // inputs
        ...props,
      },
      opts
    );
  }
}
