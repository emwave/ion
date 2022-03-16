// Copyright © 2022 the Ion authors. All rights reserved. MIT license.

import { createProxyHandler } from "../internals/object_proxy.ts";
import { IonBodyParser } from "./body_parser.ts";

export class IonRequest {
  public readonly method: string;
  public readonly url: URL;
  private _body: null | { [name: string]: any } = null;

  constructor(
    private _req: Request,
    private _pattern?: URLPattern,
  ) {
    this.method = _req.method;
    this.url = new URL(_req.url);
  }

  public setPattern(pattern: URLPattern) {
    this._pattern = pattern;
  }

  public get body() {
    return this._body;
  }

  public async parseBody() {
    const parser = new IonBodyParser(this._req);
    this._body = await parser.parse();
  }

  public get headers() {
    const headers = new Proxy({}, createProxyHandler(true, false));

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
    if (this._pattern) {
      const match = this._pattern.exec(this.url.href);
      return match?.pathname.groups || {};
    }
    return {};
  }
}
