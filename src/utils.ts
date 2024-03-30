import { importAccountFromPrivateKey as accAvalanchePk } from '@aleph-sdk/avalanche';
// import { importAccountFromPrivateKey as accSolanaPk } from '@aleph-sdk/solana';
import { importAccountFromPrivateKey as accTezosPk } from '@aleph-sdk/tezos';
import {
  importAccountFromMnemonic as accEtherumMne,
  importAccountFromPrivateKey as accEtherumPk,
} from '@aleph-sdk/ethereum';
import {
  importAccountFromMnemonic as accCosmosMne,
  importAccountFromPrivateKey as accCosmosPk,
} from '@aleph-sdk/cosmos';
import {
  importAccountFromMnemonic as accNuls2Mne,
  importAccountFromPrivateKey as accNuls2Pk,
} from '@aleph-sdk/nuls2';
import {
  importAccountFromMnemonic as accSubstrateMne,
  importAccountFromPrivateKey as accSubstratePk,
} from '@aleph-sdk/substrate';
import * as crypto from 'crypto';
import type { Account } from '@aleph-sdk/account';
import { DEFAULT_API_V2 } from '@aleph-sdk/core';
import { createWriteStream, lstatSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join, basename, dirname } from 'path';
import { default as archiver } from 'archiver';

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
    // case 'SOLANA': {
    //   switch (method) {
    //     case 'PRIVATEKEY': {
    //       return await accSolanaPk(val);
    //     }
    //     default: {
    //       throw new Error(`invalid method ${method} for ${chain}`);
    //     }
    //   }
    // }
    case 'TEZOS': {
      switch (method) {
        case 'PRIVATEKEY': {
          return await accTezosPk(val);
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

export const hashData = (s: string | Buffer) => {
  return crypto.createHash('sha512').update(s).digest('hex');
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

export const getRawFileUrl = (content_item_hash: string) => {
  return DEFAULT_API_V2 + encodeURIComponent(content_item_hash);
};

export const zipPath = async (key: string, path: string) => {
  if (path.endsWith('.zip')) {
    return path;
  }
  const outputPath = join(tmpdir(), 'alumi', `${key}.zip`);
  mkdirSync(dirname(outputPath), { recursive: true });
  const output = createWriteStream(outputPath);
  const archive = archiver('zip', {
    zlib: { level: 8 },
  });
  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      console.log(err);
    } else {
      throw err;
    }
  });
  archive.on('error', function (err) {
    throw err;
  });
  archive.pipe(output);
  const fileStat = lstatSync(path);
  if (fileStat.isDirectory()) {
    archive.directory(path, '/', { prefix: '/' });
  } else if (fileStat.isFile()) {
    archive.file(path, { name: basename(path) });
  } else {
    throw new Error(`invalid path ${path}`);
  }
  await archive.finalize();
  while (!output.closed) {
    await new Promise(r => setTimeout(r, 100));
  }
  return outputPath;
};
