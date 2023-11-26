import { basicTest, BasicTest } from "pulumi-dynamic-provider-aleph";

console.log("test!");
basicTest();

const res = new BasicTest("abc", { foo: "barbaz"});
export const lenName = res.lenName;
