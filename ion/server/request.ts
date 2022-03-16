// Copyright © 2022 the Ion authors. All rights reserved. MIT license.

import { createProxyHandler } from "../internals/object_proxy.ts";

export class IonRequest {
  public readonly method: string;
  public readonly url: URL;

  constructor(
    private _req: Request,
    private _pattern: URLPattern,
  ) {
    this.method = _req.method;
    this.url = new URL(_req.url);
  }

  public get headers() {
    const headers = new Proxy({}, createProxyHandler(true, true));

    for (const [name, value] of this._req.headers.entries()) {
      headers[name] = value;
    }

    return headers;
  }

  public get query() {
    const query = new Proxy({}, createProxyHandler());

    for (const [name, value] of this.url.searchParams.entries()) {
      query[name] = value;
    }

    return query;
  }

  public get params() {
    const match = this._pattern.exec(this.url.href);

    return match?.pathname.groups || {};
  }
}
