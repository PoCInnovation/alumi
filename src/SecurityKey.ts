import { Aggregate } from './Aggregate';
import type { ItemType } from 'aleph-sdk-ts/dist/messages/types/base';

export type SecurityKeyTypes = 'POST' | 'AGGREGATE' | 'STORE';

export type SecurityKeyAuthorization = {
  address: string;
  types?: Array<SecurityKeyTypes>;
  post_types?: Array<string>;
  aggregate_keys?: Array<string>;
  chains?: Array<string>;
  channels?: Array<string>;
};

export interface SecurityKeyConf {
  authorizations: Array<SecurityKeyAuthorization>;
  storageEngine: ItemType;
  accountEnvName: string;
}

export const securityKey = (name: string, conf: SecurityKeyConf) => {
  const content = {
    authorizations: conf.authorizations,
  };
  return new Aggregate(name, {
    key: name,
    content: content,
    channel: 'security',
    storageEngine: conf.storageEngine,
    accountEnvName: conf.accountEnvName,
  });
};
