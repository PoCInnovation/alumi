import { StoreString } from './StoreString';
import type { ItemType } from '@aleph-sdk/message';
import { readFileSync } from 'fs';
import * as mime from 'mime-types';

export interface StoreFileConf {
  filePath: string;
  channel: string;
  accountEnvName: string;
  storageEngine: ItemType.ipfs | ItemType.storage;
}

export const storeFile = (name: string, conf: StoreFileConf) => {
  const stringContent = readFileSync(conf.filePath).toString();
  const mimeType = mime.lookup(conf.filePath) || 'text/plain';
  return new StoreString(name, {
    stringContent: stringContent,
    stringContentMimeType: mimeType,
    storageEngine: conf.storageEngine,
    channel: conf.channel,
    accountEnvName: conf.accountEnvName,
  });
};
