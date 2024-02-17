import * as pulumi from '@pulumi/pulumi';
import { messages } from 'aleph-sdk-ts';
import type { ItemType } from 'aleph-sdk-ts/dist/messages/types/base.d.ts';
import { ImportAccountFromMnemonic } from 'aleph-sdk-ts/dist/accounts/ethereum';

export type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

export interface AggregateInputs {
  key: pulumi.Input<string>;
  content: pulumi.Input<{ [x: string]: JSONValue }>;
  channel: pulumi.Input<string>;
  storageEngine: pulumi.Input<ItemType>;
}

interface AggregateProviderInputs {
  key: string;
  content: { [x: string]: JSONValue };
  channel: string;
  storageEngine?: ItemType;
}

interface AggregateProviderOutputs {
  key: string;
  chain: string;
  sender: string;
  type: string;
  channel: string;
  confirmed: boolean;
  signature: string;
  size: number;
  time: number;
  item_type: string;
  item_content?: string;
  hash_type?: string;
  item_hash: string;
  aleph_explorer_url: string;
  content: { [x: string]: JSONValue };
  storageEngine?: ItemType;
}

const keyProp = 'key';
const contentProp = 'content';
const channelProp = 'channel';
const storageEngineProp = 'storageEngine';

const AggregateProvider: pulumi.dynamic.ResourceProvider = {
  async diff(
    id: string,
    olds: AggregateProviderOutputs,
    news: AggregateProviderInputs
  ) {
    const deleteAndReplace = [];
    const replaces = [];
    const changes = [];

    if (olds[contentProp] !== news[contentProp]) {
      changes.push(contentProp);
    }
    if (olds[channelProp] !== news[channelProp]) {
      changes.push(channelProp);
    }
    if (olds[storageEngineProp] !== news[storageEngineProp]) {
      replaces.push(storageEngineProp);
    }
    if (olds[keyProp] !== news[keyProp]) {
      deleteAndReplace.push(keyProp);
    }

    if (deleteAndReplace.length > 0) {
      return { deleteAndReplace: true };
    } else if (replaces.length > 0) {
      return { replaces: replaces };
    } else if (changes.length > 0) {
      return { changes: true };
    } else {
      return {};
    }
  },

  async update(
    id: string,
    olds: AggregateProviderOutputs,
    news: AggregateProviderInputs
  ) {
    const inputs = {
      content: news[contentProp],
      channel: news[channelProp],
      storageEngine: news[storageEngineProp],
    };
    return await this.create(inputs);
  },

  async delete(id: string, props: AggregateProviderOutputs) {
    if (
      process.env.ACCOUNT_MNEMONIC === undefined ||
      process.env.ACCOUNT_MNEMONIC === ''
    ) {
      throw new Error('ACCOUNT_MNEMONIC is not set');
    }
    const account = ImportAccountFromMnemonic(process.env.ACCOUNT_MNEMONIC);
    await messages.forget.Publish({
      account: account,
      channel: props.channel,
      hashes: [props.item_hash],
    });
  },

  async create(
    inputs: AggregateProviderInputs
  ): Promise<pulumi.dynamic.CreateResult<AggregateProviderOutputs>> {
    if (
      process.env.ACCOUNT_MNEMONIC === undefined ||
      process.env.ACCOUNT_MNEMONIC === ''
    ) {
      throw new Error('ACCOUNT_MNEMONIC is not set');
    }
    const opts: { [key: string]: any } = {};
    if (process.env.DELEGATE_ADDRESS !== undefined) {
      opts.address = process.env.DELEGATE_ADDRESS;
    }
    const account = ImportAccountFromMnemonic(process.env.ACCOUNT_MNEMONIC);
    const res = await messages.aggregate.Publish({
      ...opts,
      account: account,
      key: inputs[keyProp],
      content: inputs[contentProp],
      channel: inputs[channelProp],
      storageEngine: inputs[storageEngineProp],
    });

    const out: AggregateProviderOutputs = {
      ...inputs,
      chain: res.chain,
      sender: res.sender,
      type: res.type,
      channel: res.channel,
      confirmed: res.confirmed,
      signature: res.signature,
      size: res.size,
      time: res.time,
      item_type: res.item_type,
      item_hash: res.item_hash,
      aleph_explorer_url: `https://explorer.aleph.im/address/${res.chain}/${res.sender}/message/${res.type}/${res.item_hash}`,
    };
    if (res.item_content !== undefined) {
      out.item_content = res.item_content;
    }
    if (res.hash_type !== undefined) {
      out.hash_type = res.hash_type;
    }

    return {
      id: `${account.address}-${res.item_hash}`,
      outs: out,
    };
  },

  async read(id: string, props: AggregateProviderInputs) {
    if (process.env.DELEGATE_ADDRESS === undefined) {
      throw new Error('DELEGATE_ADDRESS is not set');
    }
    const res: { [key: string]: JSONValue } = await messages.aggregate.Get({
      keys: [props.key],
      address: process.env.DELEGATE_ADDRESS,
    });

    if (res[props.key] === null || res[props.key] === undefined) {
      throw new Error('Aggregate not found');
    }

    throw new Error('Not implemented:: Pulumi does not support returning values needed for this');

  //   const out: AggregateProviderOutputs = {
  //     ...props,
  //     chain: res.posts[0].chain,
  //     sender: res.posts[0].sender,
  //     type: res.posts[0].type,
  //     channel: res.posts[0].channel,
  //     confirmed: res.posts[0].confirmed,
  //     signature: res.posts[0].signature,
  //     size: res.posts[0].size,
  //     time: res.posts[0].time,
  //     item_type: res.posts[0].item_type,
  //     item_hash: res.posts[0].item_hash,
  //     aleph_explorer_url: `https://explorer.aleph.im/address/${res.posts[0].chain}/${res.posts[0].sender}/message/${res.posts[0].type}/${res.posts[0].item_hash}`,
  //   };
  //
  //   return {
  //     id: id,
  //     outs: out,
  //   };
  },
};

export class Aggregate extends pulumi.dynamic.Resource {
  public readonly chain!: pulumi.Output<string>;
  public readonly sender!: pulumi.Output<string>;
  public readonly type!: pulumi.Output<string>;
  public readonly channel!: pulumi.Output<string>;
  public readonly confirmed!: pulumi.Output<boolean>;
  public readonly signature!: pulumi.Output<string>;
  public readonly size!: pulumi.Output<number>;
  public readonly time!: pulumi.Output<number>;
  public readonly item_type!: pulumi.Output<string>;
  public readonly item_content!: pulumi.Output<string | undefined>;
  public readonly hash_type!: pulumi.Output<string | undefined>;
  public readonly item_hash!: pulumi.Output<string>;
  public readonly aleph_explorer_url!: pulumi.Output<string>;

  constructor(
    name: string,
    props: AggregateInputs,
    opts?: pulumi.CustomResourceOptions
  ) {
    if (
      process.env.ACCOUNT_MNEMONIC === undefined ||
      process.env.ACCOUNT_MNEMONIC === ''
    ) {
      throw new Error('ACCOUNT_MNEMONIC is not set');
    }
    super(
      AggregateProvider,
      name,
      {
        ...props,
        chain: undefined,
        sender: undefined,
        type: undefined,
        confirmed: undefined,
        signature: undefined,
        size: undefined,
        time: undefined,
        item_type: undefined,
        item_content: undefined,
        hash_type: undefined,
        item_hash: undefined,
        aleph_explorer_url: undefined,
      },
      opts
    );
  }
}
