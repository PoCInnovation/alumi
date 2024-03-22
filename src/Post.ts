import * as pulumi from '@pulumi/pulumi';
import type { ItemType } from 'aleph-sdk-ts/dist/messages/types/base.d.ts';
import { Publish as publishPost } from 'aleph-sdk-ts/dist/messages/post';
import { Publish as publishForget } from 'aleph-sdk-ts/dist/messages/forget';
import { Get as getPost } from 'aleph-sdk-ts/dist/messages/post';
import { getAccount, getAlephExplorerUrl } from './utils';
import type { JSONDict } from './types';

export interface PostInputs {
  content: pulumi.Input<JSONDict>;
  postType: pulumi.Input<string>;
  channel: pulumi.Input<string>;
  storageEngine: pulumi.Input<ItemType>;
  ref: pulumi.Input<string>; // can be empty
  accountEnvName: pulumi.Input<string>;
}

interface PostProviderInputs {
  content: JSONDict;
  postType: string;
  channel: string;
  storageEngine: ItemType;
  ref: string;
  accountEnvName: string;
}

const propContent = 'content';
const propPostType = 'postType';
const propChannel = 'channel';
const propStorageEngine = 'storageEngine';
const propRef = 'ref';
const propAccountEnvName = 'accountEnvName';

export interface PostOutputs {
  // inputs
  content: JSONDict;
  postType: string;
  storageEngine: ItemType;
  accountEnvName: string;
  // outputs
  chain: string;
  sender: string;
  type: string;
  channel: string;
  confirmed: boolean;
  signature: string;
  size: number;
  time: number;
  item_type: string;
  item_hash: string;
  // Created
  content_address: string;
  content_type: string;
  content_content: JSONDict;
  content_time: number;
  aleph_explorer_url: string;
}

const PostProvider: pulumi.dynamic.ResourceProvider = {
  async diff(id: string, olds: PostOutputs, news: PostProviderInputs) {
    const replaces = [];
    const changes = [];

    if (olds[propContent] !== news[propContent]) {
      changes.push(propContent);
    }
    if (olds[propPostType] !== news[propPostType]) {
      replaces.push(propPostType);
    }
    if (olds[propChannel] !== news[propChannel]) {
      replaces.push(propChannel);
    }
    if (olds[propStorageEngine] !== news[propStorageEngine]) {
      replaces.push(propStorageEngine);
    }

    if (replaces.length > 0) {
      return { replaces: replaces };
    } else if (changes.length > 0) {
      return { changes: true };
    } else {
      return { changes: false };
    }
  },

  async update(id: string, olds: PostOutputs, news: PostProviderInputs) {
    const inputs = {
      content: news[propContent],
      postType: 'amend',
      channel: news[propChannel],
      accountEnvName: news[propAccountEnvName],
      storageEngine: news[propStorageEngine],
      ref: olds.item_hash,
    };
    return await this.create(inputs);
  },

  async delete(id: string, props: PostOutputs) {
    const account = await getAccount(props[propAccountEnvName]);
    await publishForget({
      account: account,
      channel: props[propChannel],
      hashes: [props.item_hash],
    });
  },

  async create(
    inputs: PostProviderInputs
  ): Promise<pulumi.dynamic.CreateResult<PostOutputs>> {
    const account = await getAccount(inputs[propAccountEnvName]);
    const ref = inputs[propRef] == '' ? undefined : inputs[propRef];
    const res = await publishPost({
      account: account,
      content: inputs[propContent],
      postType: inputs[propPostType],
      channel: inputs[propChannel],
      storageEngine: inputs[propStorageEngine],
      ref: ref,
    });

    const out: PostOutputs = {
      // inputs
      content: inputs[propContent],
      postType: inputs[propPostType],
      storageEngine: inputs[propStorageEngine],
      accountEnvName: inputs[propAccountEnvName],
      // outputs
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
      // Created
      content_address: res.content.address,
      content_type: res.content.type,
      content_content:
        res.content.content !== undefined ? res.content.content : {},
      content_time: res.content.time,
      aleph_explorer_url: getAlephExplorerUrl(
        res.chain,
        res.sender,
        res.type,
        res.item_hash
      ),
    };

    return {
      id: `${account.address}-${res.item_hash}`,
      outs: out,
    };
  },

  async read(id: string, props: PostOutputs) {
    const res = await getPost({
      types: `${props.postType}`,
      hashes: [props.item_hash],
    });
    if (res.posts.length != 1) {
      throw new Error(
        `Post not found (found ${res.posts.length} posts corresponding with hash '${id}' and type '${props.postType},amend')`
      );
    }

    const out: PostOutputs = {
      ...props,
      chain: res.posts[0].chain,
      sender: res.posts[0].sender,
      type: res.posts[0].type,
      channel: res.posts[0].channel,
      confirmed: res.posts[0].confirmed,
      signature: res.posts[0].signature,
      size: res.posts[0].size,
      time: res.posts[0].time,
      item_type: res.posts[0].item_type,
      item_hash: res.posts[0].item_hash,
      // @ts-ignore
      content_address: res.posts[0].content.address,
      // @ts-ignore
      content_type: res.posts[0].content.type,
      // @ts-ignore
      content_content: res.posts[0].content.content,
      // @ts-ignore
      content_time: res.posts[0].content.time,
      aleph_explorer_url: getAlephExplorerUrl(
        res.posts[0].chain,
        res.posts[0].sender,
        res.posts[0].type,
        res.posts[0].item_hash
      ),
    };

    return {
      id: id,
      outs: out,
    };
  },
};

export class Post extends pulumi.dynamic.Resource {
  // inputs
  public readonly content!: pulumi.Output<JSONDict>;
  public readonly postType!: pulumi.Output<string>;
  public readonly storageEngine!: pulumi.Output<string>;
  public readonly accountEnvName!: pulumi.Output<string>;
  // outputs
  public readonly chain!: pulumi.Output<string>;
  public readonly sender!: pulumi.Output<string>;
  public readonly type!: pulumi.Output<string>;
  public readonly channel!: pulumi.Output<string>;
  public readonly confirmed!: pulumi.Output<boolean>;
  public readonly signature!: pulumi.Output<string>;
  public readonly size!: pulumi.Output<number>;
  public readonly time!: pulumi.Output<number>;
  public readonly item_type!: pulumi.Output<string>;
  public readonly item_hash!: pulumi.Output<string>;
  // Created
  public readonly content_address!: pulumi.Output<string>;
  public readonly content_type!: pulumi.Output<string>;
  public readonly content_content!: pulumi.Output<JSONDict>;
  public readonly content_time!: pulumi.Output<number>;
  public readonly aleph_explorer_url!: pulumi.Output<string>;

  constructor(
    name: string,
    props: PostInputs,
    opts?: pulumi.CustomResourceOptions
  ) {
    super(
      PostProvider,
      name,
      {
        // outputs
        chain: undefined,
        sender: undefined,
        type: undefined,
        confirmed: undefined,
        signature: undefined,
        size: undefined,
        time: undefined,
        item_type: undefined,
        item_hash: undefined,
        // Created
        content_address: undefined,
        content_type: undefined,
        content_content: undefined,
        content_time: undefined,
        aleph_explorer_url: undefined,
        // inputs
        ...props,
      },
      opts
    );
  }
}
