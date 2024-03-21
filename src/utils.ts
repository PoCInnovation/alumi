import { ImportAccountFromPrivateKey as accAvalanchePk } from 'aleph-sdk-ts/dist/accounts/avalanche';
// import { ImportAccountFromPrivateKey as accSolanaPk } from 'aleph-sdk-ts/dist/accounts/solana';
// import { ImportAccountFromPrivateKey as accTezosPk } from 'aleph-sdk-ts/dist/accounts/tezos';
import {
  ImportAccountFromMnemonic as accEtherumMne,
  ImportAccountFromPrivateKey as accEtherumPk,
} from 'aleph-sdk-ts/dist/accounts/ethereum';
import {
  ImportAccountFromMnemonic as accCosmosMne,
  ImportAccountFromPrivateKey as accCosmosPk,
} from 'aleph-sdk-ts/dist/accounts/cosmos';
import {
  ImportAccountFromMnemonic as accNuls2Mne,
  ImportAccountFromPrivateKey as accNuls2Pk,
} from 'aleph-sdk-ts/dist/accounts/nuls2';
import {
  ImportAccountFromMnemonic as accSubstrateMne,
  ImportAccountFromPrivateKey as accSubstratePk,
} from 'aleph-sdk-ts/dist/accounts/substrate';
import * as crypto from 'crypto';
import type { Account } from 'aleph-sdk-ts/dist/accounts/account.d.ts';

export const getAccount = async (envName?: string): Promise<Account> => {
  if (envName === undefined) {
    throw new Error('Missing env');
  }
  const envVal = process.env[envName];
  if (envVal === undefined || envVal === '') {
    throw new Error(`Missing env ${envName} / or empty`);
  }

  const splits = envVal.split(':');
  if (splits.length !== 3) {
    throw new Error(`Invalid env ${envName}: ${envVal}`);
  }
  const chain = splits[0];
  const method = splits[1];
  const val = splits[2];

  switch (chain) {
    case 'AVALANCHE': {
      switch (method) {
        case 'PRIVATEKEY': {
          return await accAvalanchePk(val);
        }
        default: {
          throw new Error(`invalid method ${method} for ${chain}`);
        }
      }
    }
    case 'ETHERUM': {
      switch (method) {
        case 'MNEMONIK': {
          return accEtherumMne(val);
        }
        case 'PRIVATEKEY': {
          return accEtherumPk(val);
        }
        default: {
          throw new Error(`invalid method ${method} for ${chain}`);
        }
      }
    }
    case 'COSMOS': {
      switch (method) {
        case 'MNEMONIK': {
          return await accCosmosMne(val);
        }
        case 'PRIVATEKEY': {
          return await accCosmosPk(val);
        }
        default: {
          throw new Error(`invalid method ${method} for ${chain}`);
        }
      }
    }
    case 'NULS2': {
      switch (method) {
        case 'MNEMONIK': {
          return await accNuls2Mne(val);
        }
        case 'PRIVATEKEY': {
          return await accNuls2Pk(val);
        }
        default: {
          throw new Error(`invalid method ${method} for ${chain}`);
        }
      }
    }
    case 'SUBSTRATE': {
      switch (method) {
        case 'MNEMONIK': {
          return await accSubstrateMne(val);
        }
        case 'PRIVATEKEY': {
          return await accSubstratePk(val);
        }
        default: {
          throw new Error(`invalid method ${method} for ${chain}`);
        }
      }
    }
    default: {
      throw new Error(`invalid chain ${chain}`);
    }
  }
};

export const hashString = (s: string) => {
  return crypto.createHash('md5').update(s).digest('hex');
};

export const getAlephExplorerUrl = (
  chain: string,
  sender: string,
  type: string,
  item_hash: string
) => {
  return (
    'https://explorer.aleph.im/address/' +
    encodeURIComponent(chain) +
    '/' +
    encodeURIComponent(sender) +
    '/message/' +
    encodeURIComponent(type) +
    '/' +
    encodeURIComponent(item_hash)
  );
};
