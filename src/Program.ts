import * as pulumi from '@pulumi/pulumi';
import type { ItemType } from 'aleph-sdk-ts/dist/messages/types/base.d.ts';
import type { MachineVolume } from 'aleph-sdk-ts/dist/messages/types';
import { publish as publishProgram } from 'aleph-sdk-ts/dist/messages/program';
import { Publish as publishForget } from 'aleph-sdk-ts/dist/messages/forget';
import { readFileSync } from 'fs';
import { getAccount, hashString, getAlephExplorerUrl, zipPath } from './utils';

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
  inlineRequested: pulumi.Input<boolean>;
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
  inlineRequested: boolean;
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
const propInlineRequested = 'inlineRequested';
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
  inlineRequested: boolean;
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
    const outPathZip = await zipPath(
      hashString(news[propPath]),
      news[propPath]
    );
    const zipString = readFileSync(outPathZip).toString();
    if (olds.zip_hash !== hashString(zipString)) {
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
    if (olds[propInlineRequested] !== news[propInlineRequested]) {
      replaces.push(propInlineRequested);
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
    await publishForget({
      account: account,
      channel: props[propChannel],
      hashes: [props.item_hash],
    });
  },

  async create(
    inputs: ProgramProviderInputs
  ): Promise<pulumi.dynamic.CreateResult<ProgramOutputs>> {
    const account = await getAccount(inputs[propAccountEnvName]);
    const outPathZip = await zipPath(
      hashString(inputs[propPath]),
      inputs[propPath]
    );
    const zipString = readFileSync(outPathZip).toString();
    const zipHash = hashString(zipString);
    const zipBlob = new Blob([zipString], {
      type: 'application/zip',
    });
    const res = await publishProgram({
      account: account,
      channel: inputs[propChannel],
      file: zipBlob,
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
      inlineRequested: inputs[propInlineRequested],
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
      inlineRequested: inputs[propInlineRequested],
      accountEnvName: inputs[propAccountEnvName],
      // outputs
      chain: res.chain,
      sender: res.sender,
      type: res.type,
      item_hash: res.item_hash,
      // Created
      aleph_explorer_url: getAlephExplorerUrl(
        res.chain,
        res.sender,
        res.type,
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
  public readonly inlineRequested!: pulumi.Output<boolean>;
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
