// Copyright © 2022 the Ion authors. All rights reserved. MIT license.

export function createProxyHandler(
  lowerProp: boolean = false,
  overWrite: boolean = false,
) {
  const handler = {
    get: (
      t: { [name: string]: any },
      p: string | symbol,
      r: any,
    ): any => {
      return t[lowerProp ? p.toString().toLowerCase() : p.toString()];
    },
    set: (
      t: { [name: string]: any },
      p: string | symbol,
      v: any,
      r: any,
    ): boolean => {
      if (
        ((lowerProp ? p.toString().toLowerCase() : p.toString()) in t) &&
        !overWrite
      ) {
        return false;
      }
      t[lowerProp ? p.toString().toLowerCase() : p.toString()] = v;
      return true;
    },
  };
  return handler;
}
