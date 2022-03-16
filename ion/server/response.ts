// Copyright © 2022 the Ion authors. All rights reserved. MIT license.

import { createProxyHandler } from "../internals/object_proxy.ts";

export class IonResponse {
  private _headers: { [name: string]: any };

  constructor(
    public status: number = 200,
    public statusText: string = "",
  ) {
    this._headers = new Proxy({}, createProxyHandler(true, true));
  }

  public get headers() {
    return this._headers;
  }
}
