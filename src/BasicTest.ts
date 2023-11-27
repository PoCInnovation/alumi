import * as pulumi from '@pulumi/pulumi';

export interface BasicTestInputs {
  foo: pulumi.Input<string>;
}

interface BasicTestProviderInputs {
  foo: string;
}

interface BasicTestProviderOutputs {
  lenName: number;
}

const fooProp = 'foo';

const BasicTestProvider: pulumi.dynamic.ResourceProvider = {
  // check = async (olds: any, news: any) => {
  //   const failedChecks = [];
  //
  //   if (news[fooProp] === undefined) {
  //     failedChecks.push({
  //       property: fooProp,
  //       reason: `required property '${fooProp}' missing`,
  //     });
  //   }
  //
  //   return { inputs: news, failedChecks: failedChecks };
  // };
  //
  async diff(
    id: string,
    olds: BasicTestProviderInputs,
    news: BasicTestProviderInputs
  ) {
    const replaces = [];

    if (olds[fooProp] !== news[fooProp]) {
      replaces.push(fooProp);
    }

    return { replaces: replaces };
  },

  async create(
    inputs: BasicTestProviderInputs
  ): Promise<pulumi.dynamic.CreateResult> {
    return {
      id: `${inputs[fooProp]}StaticWebsite`,
      outs: { lenName: inputs[fooProp].length },
    };
  },
};

export class BasicTest extends pulumi.dynamic.Resource {
  public readonly lenName!: pulumi.Output<number>;

  constructor(
    name: string,
    props: BasicTestInputs,
    opts?: pulumi.CustomResourceOptions
  ) {
    super(BasicTestProvider, name, { ...props, lenName: undefined }, opts);
  }
}
