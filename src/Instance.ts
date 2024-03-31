import * as pulumi from '@pulumi/pulumi';
import type { ItemType, MachineVolume } from '@aleph-sdk/message';
import { AuthenticatedAlephHttpClient } from '@aleph-sdk/client';
import { getAccount, getAlephExplorerUrl } from './utils';
import type { Volume } from './volumes';

export interface InstanceInputs {
  channel: pulumi.Input<string>;
  authorizedKeys: pulumi.Input<string[]>;
  memory: pulumi.Input<number>;
  image: pulumi.Input<string>;
  volumes: pulumi.Input<Array<Volume>>;
  storageEngine: pulumi.Input<ItemType.storage | ItemType.ipfs>;
  accountEnvName: pulumi.Input<string>;
}

interface InstanceProviderInputs {
  channel: string;
  authorizedKeys: string[];
  memory: number;
  image: string;
  volumes: Array<Volume>;
  storageEngine: ItemType.storage | ItemType.ipfs;
  accountEnvName: string;
}

const propChannel = 'channel';
const propAuthorizedKeys = 'authorizedKeys';
const propMemory = 'memory';
const propImage = 'image';
const propVolumes = 'volumes';
const propStorageEngine = 'storageEngine';
const propAccountEnvName = 'accountEnvName';

export interface InstanceOutputs {
  // inputs
  channel: string;
  authorizedKeys: string[];
  memory: number;
  image: string;
  volumes: Array<Volume>;
  storageEngine: ItemType.storage | ItemType.ipfs;
  accountEnvName: string;
  // outputs
  chain: string;
  sender: string;
  type: string;
  item_hash: string;
  // Created
  aleph_explorer_url: string;
}

export const getDefaultImage = () => {
  return '549ec451d9b099cad112d4aaa2c00ac40fb6729a92ff252ff22eef0b5c3cb613';
};

const InstanceProvider: pulumi.dynamic.ResourceProvider = {
  async diff(id: string, olds: InstanceOutputs, news: InstanceProviderInputs) {
    const replaces = [];

    if (olds[propChannel] !== news[propChannel]) {
      replaces.push(propChannel);
    }
    if (olds[propAuthorizedKeys] !== news[propAuthorizedKeys]) {
      replaces.push(propAuthorizedKeys);
    }
    if (olds[propMemory] !== news[propMemory]) {
      replaces.push(propMemory);
    }
    if (olds[propImage] !== news[propImage]) {
      replaces.push(propImage);
    }
    if (
      JSON.stringify(olds[propVolumes]) !== JSON.stringify(news[propVolumes])
    ) {
      replaces.push(propVolumes);
    }
    if (olds[propStorageEngine] !== news[propStorageEngine]) {
      replaces.push(propStorageEngine);
    }
    if (replaces.length === 0) {
      return { changes: false };
    }
    return { replaces: replaces };
  },

  async update(id: string, olds: InstanceOutputs, news: InstanceInputs) {
    throw new Error('Update not implemented; Only Delete and Create');
  },

  async delete(id: string, props: InstanceOutputs) {
    const account = await getAccount(props[propAccountEnvName]);
    const client = new AuthenticatedAlephHttpClient(account);
    await client.forget({
      channel: props[propChannel],
      hashes: [props.item_hash],
      sync: true,
    });
  },

  async create(
    inputs: InstanceProviderInputs
  ): Promise<pulumi.dynamic.CreateResult<InstanceOutputs>> {
    const account = await getAccount(inputs[propAccountEnvName]);
    const client = new AuthenticatedAlephHttpClient(account);
    const res = await client.createInstance({
      channel: inputs[propChannel],
      authorized_keys: inputs[propAuthorizedKeys],
      resources: {
        memory: inputs[propMemory],
      },
      image: inputs[propImage],
      volumes: inputs[propVolumes].map((volume): MachineVolume => {
        if (volume._type === 'immutable') {
          return {
            ...volume,
            is_read_only: () => true,
          };
        } else if (volume._type === 'ephemeral') {
          return {
            ...volume,
            is_read_only: () => false,
          };
        } else {
          throw new Error('Invalid volume type: This should never happen.');
        }
      }),
      storageEngine: inputs[propStorageEngine],
    });
    const out: InstanceOutputs = {
      // inputs
      channel: inputs[propChannel],
      authorizedKeys: inputs[propAuthorizedKeys],
      memory: inputs[propMemory],
      image: inputs[propImage],
      volumes: inputs[propVolumes],
      storageEngine: inputs[propStorageEngine],
      accountEnvName: inputs[propAccountEnvName],
      // outputs
      chain: res.chain,
      sender: res.sender,
      type: `${res.type}`,
      item_hash: res.item_hash,
      // Created
      aleph_explorer_url: getAlephExplorerUrl(
        res.chain,
        res.sender,
        'INSTANCE',
        res.item_hash
      ),
    };
    return {
      id: `${account.address}-${res.item_hash}`,
      outs: out,
    };
  },
};

export class Instance extends pulumi.dynamic.Resource {
  // inputs
  public readonly channel!: pulumi.Output<string>;
  public readonly authorizedKeys!: pulumi.Output<string[]>;
  public readonly memory!: pulumi.Output<number>;
  public readonly image!: pulumi.Output<string>;
  public readonly volumes!: pulumi.Output<Array<Volume>>;
  public readonly storageEngine!: pulumi.Output<
    ItemType.storage | ItemType.ipfs
  >;
  public readonly accountEnvName!: pulumi.Output<string>;
  // outputs
  public readonly chain!: pulumi.Output<string>;
  public readonly sender!: pulumi.Output<string>;
  public readonly type!: pulumi.Output<string>;
  public readonly item_hash!: pulumi.Output<string>;
  // Created
  public readonly aleph_explorer_url!: pulumi.Output<string>;

  constructor(
    name: string,
    args: InstanceInputs,
    opts?: pulumi.CustomResourceOptions
  ) {
    super(
      InstanceProvider,
      name,
      {
        // outputs
        chain: undefined,
        sender: undefined,
        type: undefined,
        item_hash: undefined,
        // Created
        aleph_explorer_url: undefined,
        ...args,
      },
      opts
    );
  }
}
