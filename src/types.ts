export type JSONValue = string | number | boolean | JSONDict | Array<JSONValue>;

export type JSONDict = { [x: string]: JSONValue };
