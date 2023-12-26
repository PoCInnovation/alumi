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

export interface MessageInputs {
  content: pulumi.Input<{ [x: string]: JSONValue }>;
  postType: pulumi.Input<string>;
  channel: pulumi.Input<string>;
  storageEngine: pulumi.Input<ItemType>;
}

interface MessageProviderInputs {
  content: { [x: string]: JSONValue };
  postType: string;
  channel: string;
  storageEngine?: ItemType;
  ref?: string;
}

interface MessageProviderOutputs {
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
  postType: string;
  storageEngine?: ItemType;
}

const contentProp = 'content';
const postTypeProp = 'postType';
const channelProp = 'channel';
const storageEngineProp = 'storageEngine';

const MessageProvider: pulumi.dynamic.ResourceProvider = {
  async diff(
    id: string,
    olds: MessageProviderOutputs,
    news: MessageProviderInputs
  ) {
    const deleteAndReplace = [];
    const replaces = [];
    const changes = [];

    if (olds[contentProp] !== news[contentProp]) {
      changes.push(contentProp);
    }
    if (olds[postTypeProp] !== news[postTypeProp]) {
      deleteAndReplace.push(postTypeProp);
    }
    if (olds[channelProp] !== news[channelProp]) {
      changes.push(channelProp);
    }
    if (olds[storageEngineProp] !== news[storageEngineProp]) {
      replaces.push(storageEngineProp);
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
    olds: MessageProviderOutputs,
    news: MessageProviderInputs
  ) {
    const inputs = {
      content: news[contentProp],
      postType: 'amend',
      channel: news[channelProp],
      storageEngine: news[storageEngineProp],
      ref: olds.item_hash,
    };
    return await this.create(news);
  },

  async delete(id: string, props: MessageProviderOutputs) {
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
    inputs: MessageProviderInputs
  ): Promise<pulumi.dynamic.CreateResult<MessageProviderOutputs>> {
    if (
      process.env.ACCOUNT_MNEMONIC === undefined ||
      process.env.ACCOUNT_MNEMONIC === ''
    ) {
      throw new Error('ACCOUNT_MNEMONIC is not set');
    }
    const account = ImportAccountFromMnemonic(process.env.ACCOUNT_MNEMONIC);
    const res = await messages.post.Publish({
      account: account,
      content: inputs[contentProp],
      postType: inputs[postTypeProp],
      channel: inputs[channelProp],
      storageEngine: inputs[storageEngineProp],
      ref: inputs.ref,
    });

    const out: MessageProviderOutputs = {
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
};

export class Message extends pulumi.dynamic.Resource {
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
    props: MessageInputs,
    opts?: pulumi.CustomResourceOptions
  ) {
    if (
      process.env.ACCOUNT_MNEMONIC === undefined ||
      process.env.ACCOUNT_MNEMONIC === ''
    ) {
      throw new Error('ACCOUNT_MNEMONIC is not set');
    }
    super(
      MessageProvider,
      name,
      {
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
        ...props,
      },
      opts
    );
  }
}
