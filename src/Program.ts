import * as pulumi from '@pulumi/pulumi';
import type { ItemType, MachineVolume } from '@aleph-sdk/message';
import { AuthenticatedAlephHttpClient } from '@aleph-sdk/client';
import { readFileSync } from 'fs';
import { getAccount, hashData, getAlephExplorerUrl, zipPath } from './utils';

// TODO: no subscription for now because broken
// export type Subscription = Array<{ sender: string; channel: string }>;

type AbstractVolume = {
  mount: Array<string>;
  _type: 'immutable' | 'ephemeral';
};

type ImmutableVolume = AbstractVolume & {
  ref: string;
  use_latest: boolean;
  _type: 'immutable';
};

export const getImmutableVolume = (
  ref: string,
  use_latest: boolean,
  mount: Array<string>
): ImmutableVolume => {
  return {
    mount: mount,
    ref: ref,
    use_latest: use_latest,
    _type: 'immutable',
  };
};

type EphemeralVolume = AbstractVolume & {
  ephemeral: true;
  size_mib: number;
  _type: 'ephemeral';
};

export const getEphemeralVolume = (
  size_mib: number,
  mount: Array<string>
): EphemeralVolume => {
  return {
    mount: mount,
    ephemeral: true,
    size_mib: size_mib,
    _type: 'ephemeral',
  };
};

export type Volume = ImmutableVolume | EphemeralVolume;

export interface ProgramInputs {
  channel: pulumi.Input<string>;
  path: pulumi.Input<string>;
  entryPoint: pulumi.Input<string>;
  // TODO: Subscription (but broken for now)
  // subscription: pulumi.Input<Array<Subscription>>;
  memory: pulumi.Input<number>;
  runtime: pulumi.Input<string>;
  volumes: pulumi.Input<Array<Volume>>;
  storageEngine: pulumi.Input<ItemType.ipfs | ItemType.storage>;
  accountEnvName: pulumi.Input<string>;
}

interface ProgramProviderInputs {
  channel: string;
  path: string;
  entryPoint: string;
  // TODO: Subscription (but broken for now)
  // subscription: Array<Subscription>;
  memory: number;
  runtime: string;
  volumes: Array<Volume>;
  storageEngine: ItemType.ipfs | ItemType.storage;
  accountEnvName: string;
}

const propChannel = 'channel';
const propPath = 'path';
const propEntryPoint = 'entryPoint';
// TODO: Subscription (but broken for now)
// const propSubscription = 'subscription';
const propMemory = 'memory';
const propRuntime = 'runtime';
const propVolumes = 'volumes';
const propStorageEngine = 'storageEngine';
const propAccountEnvName = 'accountEnvName';

export interface ProgramOutputs {
  // inputs
  channel: string;
  path: string;
  entryPoint: string;
  // TODO: Subscription (but broken for now)
  // subscription: Array<Subscription>;
  memory: number;
  runtime: string;
  volumes: Array<Volume>;
  storageEngine: ItemType.ipfs | ItemType.storage;
  accountEnvName: string;
  // outputs
  chain: string;
  sender: string;
  type: string;
  item_hash: string;
  // Created
  aleph_explorer_url: string;
  aleph_vm_url: string;
  zip_hash: string;
}

export const getDefaultRuntime = () => {
  return 'f873715dc2feec3833074bd4b8745363a0e0093746b987b4c8191268883b2463';
};

const ProgramProvider: pulumi.dynamic.ResourceProvider = {
  async diff(id: string, olds: ProgramOutputs, news: ProgramProviderInputs) {
    // TODO: allow changes
    const replaces = [];

    if (olds[propChannel] !== news[propChannel]) {
      replaces.push(propChannel);
    }
    const outPathZip = await zipPath(hashData(news[propPath]), news[propPath]);
    const zipBuffer = readFileSync(outPathZip);
    if (olds.zip_hash !== hashData(zipBuffer)) {
      replaces.push(propPath);
    }
    if (olds[propEntryPoint] !== news[propEntryPoint]) {
      replaces.push(propEntryPoint);
    }
    // if (olds[propSubscription] !== news[propSubscription]) {
    //   replaces.push(propSubscription);
    // }
    if (olds[propMemory] !== news[propMemory]) {
      replaces.push(propMemory);
    }
    if (olds[propRuntime] !== news[propRuntime]) {
      replaces.push(propRuntime);
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

  async update(id: string, olds: ProgramOutputs, news: ProgramInputs) {
    throw new Error('Update not implemented; Only Delete and Created');
  },

  async delete(id: string, props: ProgramOutputs) {
    const account = await getAccount(props[propAccountEnvName]);
    const client = new AuthenticatedAlephHttpClient(account);
    await client.forget({
      channel: props[propChannel],
      hashes: [props.item_hash],
      sync: true,
    });
  },

  async create(
    inputs: ProgramProviderInputs
  ): Promise<pulumi.dynamic.CreateResult<ProgramOutputs>> {
    const account = await getAccount(inputs[propAccountEnvName]);
    const client = new AuthenticatedAlephHttpClient(account);
    const outPathZip = await zipPath(
      hashData(inputs[propPath]),
      inputs[propPath]
    );
    const zipBuffer = readFileSync(outPathZip);
    if (zipBuffer.length > 4 * 1024 * 1024 && inputs[propStorageEngine]) {
      throw new Error(
        `storageEngine is ${inputs[propStorageEngine]} but size of the program is ${zipBuffer.length}\nThis can lead to truncated file being sent. Use ItemType.ipfs instead.`
      );
    }
    const zipHash = hashData(zipBuffer);
    const res = await client.createProgram({
      channel: inputs[propChannel],
      file: zipBuffer,
      entrypoint: inputs[propEntryPoint],
      // TODO: Subscription (but broken for now)
      // subscription: inputs[propSubscription],
      memory: inputs[propMemory],
      runtime: inputs[propRuntime],
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
    const out: ProgramOutputs = {
      // inputs
      channel: inputs[propChannel],
      path: inputs[propPath],
      entryPoint: inputs[propEntryPoint],
      // TODO: Subscription (but broken for now)
      // subscription: inputs[propSubscription],
      memory: inputs[propMemory],
      runtime: inputs[propRuntime],
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
        'PROGRAM',
        res.item_hash
      ),
      aleph_vm_url: 'https://aleph.sh/vm/' + encodeURIComponent(res.item_hash),
      zip_hash: zipHash,
    };
    return {
      id: `${account.address}-${res.item_hash}`,
      outs: out,
    };
  },
};

export class Program extends pulumi.dynamic.Resource {
  // inputs
  public readonly channel!: pulumi.Output<string>;
  public readonly path!: pulumi.Output<string>;
  public readonly entryPoint!: pulumi.Output<string>;
  // TODO: Subscription (but broken for now)
  // public readonly subscription!: pulumi.Output<Array<Subscription>>;
  public readonly memory!: pulumi.Output<number>;
  public readonly runtime!: pulumi.Output<string>;
  public readonly volumes!: pulumi.Output<Array<Volume>>;
  public readonly storageEngine!: pulumi.Output<
    ItemType.ipfs | ItemType.storage
  >;
  public readonly accountEnvName!: pulumi.Output<string>;
  // outputs
  public readonly chain!: pulumi.Output<string>;
  public readonly sender!: pulumi.Output<string>;
  public readonly type!: pulumi.Output<string>;
  public readonly item_hash!: pulumi.Output<string>;
  // Created
  public readonly aleph_explorer_url!: pulumi.Output<string>;
  public readonly aleph_vm_url!: pulumi.Output<string>;
  public readonly zip_hash!: pulumi.Output<string>;

  constructor(
    name: string,
    args: ProgramInputs,
    opts?: pulumi.CustomResourceOptions
  ) {
    super(
      ProgramProvider,
      name,
      {
        chain: undefined,
        sender: undefined,
        type: undefined,
        item_hash: undefined,
        aleph_explorer_url: undefined,
        aleph_vm_url: undefined,
        zip_hash: undefined,
        ...args,
      },
      opts
    );
  }
}
