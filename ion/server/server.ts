// Copyright © 2022 the Ion authors. All rights reserved. MIT license.

import { IonEventEmitter } from "../internals/event_emitter.ts";
import { IonRequest } from "./request.ts";
import { IonResponse } from "./response.ts";
import { createProxyHandler } from "../internals/object_proxy.ts";

interface IonServerOptions {
  host?: string;
  port?: number;
}

export class IonServer {
  private _eventEmitter: IonEventEmitter;
  private _routes: { [name: string]: [URLPattern, Function][] };
  private _middlewares: Array<
    (ctx: {
      req: IonRequest;
      res: IonResponse;
      onComplete: (cb: () => any) => any;
    }) => void
  >;
  public refs: { [name: string]: any } = {};

  constructor(public options?: IonServerOptions) {
    this._eventEmitter = new IonEventEmitter();
    this._routes = {};
    this.options = {
      host: options?.host ?? "0.0.0.0",
      port: options?.port ?? 8080,
    };
    this._middlewares = [];
    this.refs = new Proxy({}, createProxyHandler());
  }

  public use(
    middleware: (
      ctx: {
        req: IonRequest;
        res: IonResponse;
        onComplete: (cb: () => any) => any;
      },
    ) => void,
  ) {
    this._middlewares.push(middleware);
  }

  public on<F extends Function>(type: string, cb: F) {
    this._eventEmitter.on(type, cb);

    if (type.startsWith("GET")) {
      this._addRoute("GET", type.substring(3), cb);
    }
    if (type.startsWith("PUT")) {
      this._addRoute("PUT", type.substring(3), cb);
    }
    if (type.startsWith("POST")) {
      this._addRoute("POST", type.substring(4), cb);
    }
    if (type.startsWith("PATCH")) {
      this._addRoute("PATCH", type.substring(5), cb);
    }
    if (type.startsWith("DELETE")) {
      this._addRoute("DELETE", type.substring(6), cb);
    }
    if (type.startsWith("OPTIONS")) {
      this._addRoute("OPTIONS", type.substring(7), cb);
    }
    return this;
  }

  public dispatch(type: string, ...args: any[]) {
    this._eventEmitter.dispatch(type, ...args);
    return this;
  }

  public async listen(cb?: (opt: { host: string; port: number }) => any) {
    const listener: Deno.Listener = Deno.listen({
      port: this.options?.port ?? 8080,
    });

    this._eventEmitter.dispatch("LISTEN", this.options);

    for await (const conn of listener) {
      this._handle(conn);
    }
  }

  private _addRoute<F extends Function>(
    method: string,
    pathname: string,
    handler: F,
  ) {
    if (!(method in this._routes)) {
      this._routes[method] = [];
    }
    this._routes[method].push([
      new URLPattern({ pathname: pathname.trim() }),
      handler,
    ]);
  }

  public isMethodDefined(type: string): boolean {
    return type in this._routes;
  }

  public isRouteMatch(pattern: URLPattern, url: string): boolean {
    return pattern.test(url);
  }

  private async _handle(conn: Deno.Conn) {
    const httpConn: Deno.HttpConn = Deno.serveHttp(conn);

    for await (const { request, respondWith } of httpConn) {
      let onCompleteFn: (() => any) | null = null;

      const onComplete = (cb: () => any) => onCompleteFn = cb;

      try {
        let found: boolean = false;

        const req: IonRequest = new IonRequest(request);
        const res: IonResponse = new IonResponse();

        await req.parseBody();

        for (const middleware of this._middlewares) {
          middleware({ req, res, onComplete });
        }

        this._eventEmitter.dispatch("REQ", { req, res, onComplete });

        if (this.isMethodDefined(request.method)) {
          for (const [pattern, handler] of this._routes[request.method]) {
            if (this.isRouteMatch(pattern, request.url)) {
              req.setPattern(pattern);

              let response: any = await handler({ req, res }, this.refs);

              if (
                typeof response === "string" && !res.headers["Content-Type"]
              ) {
                res.headers["Content-Type"] = "text/plain";
              } else if (
                typeof response === "object" &&
                !res.headers["Content-Type"] &&
                response !== null
              ) {
                res.headers["Content-Type"] = "application/json";
                response = JSON.stringify(response)
              }

              await respondWith(
                new Response(response, {
                  status: res.status,
                  statusText: res.statusText,
                  headers: new Headers(res.headers),
                }),
              );

              found = true;
            }
          }
        }
        if (!found) {
          await respondWith(new Response("Not Found", { status: 404 }));
        }
      } catch (e) {
        console.log(e);
      } finally {
        if (onCompleteFn) {
          (onCompleteFn as Function).call(null);
        }
      }
    }
  }
}
