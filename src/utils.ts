import type { Account } from 'aleph-sdk-ts/dist/accounts/base/Account';
import { ImportAccountFromPrivateKey as accAvalanchePk } from 'aleph-sdk-ts/dist/accounts/avalanche';
import { ImportAccountFromPrivateKey as accSolanaPk } from 'aleph-sdk-ts/dist/accounts/solana';
import { ImportAccountFromPrivateKey as accTezosPk } from 'aleph-sdk-ts/dist/accounts/tezos';
import {
  ImportAccountFromMnemonic as accEtherumMne,
  ImportAccountFromPrivateKey as accEtherumPk
} from 'aleph-sdk-ts/dist/accounts/ethereum';
import {
  ImportAccountFromMnemonic as accCosmosMne
  ImportAccountFromPrivateKey as accCosmosPk
} from 'aleph-sdk-ts/dist/accounts/cosmos'
import {
  ImportAccountFromMnemonic as accNuls2Mne
  ImportAccountFromPrivateKey as accNuls2Pk
} from 'aleph-sdk-ts/dist/accounts/nuls2'
import {
  ImportAccountFromMnemonic as accSubstrateMne
  ImportAccountFromPrivateKey as accSubstrate2Pk
} from 'aleph-sdk-ts/dist/accounts/substrate'

const choices = {
  "AVALANCHE": {
    "PRIVATEKEY": accAvalanchePk,
  },
  "SOLANA": {
    "PRIVATEKEY": accSolanaPk,
  },
  "TEZOS": {
    "PRIVATEKEY": accTezosPk,
  },
  "ETHERUM": {
    "MNEMONIK": accEtherumMne,
    "PRIVATEKEY": accEtherumPk,
  },
  "COSMOS": {
    "MNEMONIK": accCosmosMne,
    "PRIVATEKEY": accCosmosPk,
  },
  "NULS2": {
    "MNEMONIK": accNuls2Mne,
    "PRIVATEKEY": accNuls2Pk,
  },
  "SUBSTRATE": {
    "MNEMONIK": accSubstrateMne,
    "PRIVATEKEY": accSubstratePk,
  },
}

export const getAccount = (envName: string): Account => {
  const envVal = process.env[envName];
  if (
    envVal === undefined ||
    envVal === ''
  ) {
    throw new Error(`Missing env ${envName} / or empty`);
  }

  const splits = envVal.split(':');
  if (splits.length !== 3) {
    throw new Error(`Invalid env ${envName}: ${envVal}`);
  }
  const chain = splits[0];
  const method = splits[1];
  const val = splits[2];

  if (chain in choices === false) {
    throw new Error(`Invalid chain ${chain} in ${envName}; Available: ${Object.keys(choices)}`);
  }
  if (method in choices[chain] === false) {
    throw new Error(`Invalid ${method} in ${envName}; Available: ${Object.keys(choices[chain])}`);
  }
  return choices[chain][method](val);
}
