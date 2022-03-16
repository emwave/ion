// Copyright © 2022 the Ion authors. All rights reserved. MIT license.

import { IonEventEmitter } from "../internals/event_emitter.ts";
import { IonRequest } from "./request.ts";
import { IonResponse } from "./response.ts";

interface IonServerOptions {
  host?: string;
  port?: number;
}

export class IonServer {
  private _eventEmitter: IonEventEmitter;
  private _routes: { [name: string]: [URLPattern, Function][] };

  constructor(public options?: IonServerOptions) {
    this._eventEmitter = new IonEventEmitter();
    this._routes = {};

    this.options = {
      host: options?.host ?? "0.0.0.0",
      port: options?.port ?? 8080,
    };
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
      try {
        let found: boolean = false;

        if (this.isMethodDefined(request.method)) {
          for (const [pattern, handler] of this._routes[request.method]) {
            if (this.isRouteMatch(pattern, request.url)) {
              const req: IonRequest = new IonRequest(request, pattern);
              const res: IonResponse = new IonResponse();

              const response: any = handler({ req, res });

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
      }
    }
  }
}
