type AbstractVolume = {
  mount: Array<string>;
  _type: 'immutable' | 'ephemeral';
};

export type ImmutableVolume = AbstractVolume & {
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

export type EphemeralVolume = AbstractVolume & {
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
