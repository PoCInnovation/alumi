import { Aggregate } from './Aggregate'
import { ItemType } from 'aleph-sdk-ts/dist/messages/types/base';

export type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

export type SecurityKeyTypes = 'POST' | 'AGGREGATE' | 'STORE';

export interface SecurityKeyConf {
  address: string;
  types: SecurityKeyTypes[];
  postTypes: string[];
  aggregateKeys: string[];
  chains: string[];
  channels: string[];
}

export const securityKey = (name: string, conf: SecurityKeyConf) => {
  const content: {
    'authorizations': Array<
      {
        'address': string,
        'types': SecurityKeyTypes[],
        'post_types'?: string[],
        'aggregate_keys'?: string[],
        'chains'?: string[],
        'channels'?: string[],
      }
    >
  } = {
    'authorizations': [
      {
        'address': conf.address,
        'types': conf.types,
      }
    ]
  };
  if (conf.postTypes.length != 0) {
    content.authorizations[0].post_types = conf.postTypes
  }
  if (conf.aggregateKeys.length != 0) {
    content.authorizations[0].aggregate_keys = conf.aggregateKeys
  }
  if (conf.chains.length != 0) {
    content.authorizations[0].chains = conf.chains
  }
  if (conf.channels.length != 0) {
    content.authorizations[0].channels = conf.channels
  }
  return new Aggregate(name, {
    key: name,
    content: content,
    channel: 'security',
    storageEngine: ItemType.inline,
  })
}
