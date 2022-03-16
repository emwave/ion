# Ion Framework

⚛ A comprehensive framework for server-side applications. Being built on top of
TypeScript, it surprisingly supports native Web APIs. It can also be used for
REST/GraphQL and many others.

## Quick start

```ts
// app.ts
import { Server } from "https://deno.land/x/ion@0.1.1/mod.ts";

const server = new Server();

server.on("GET /", () => "Welcome!");

await server.listen();
```

## Run server
```properties
deno run --allow-net app.ts
```

## IonContext

```ts
server.on("POST /user", ({ req, res }: any) => {
  const accessToken = req.headers["Access-Token"];

  // your access token logic...
  if (accessToken === "X") {
    res.status = 201;
    return { id: 1, name: "Deno" };
  } else {
    res.status = 401;
  }
});
```

## IonRequest

```ts
// www.example.com/books/1?language=en
server.on("GET /books/:bookId", ({ req }: any) => {
  console.log(req.method); // GET
  console.log(req.url); // URL Object
  console.log(req.headers); // Request Headers
  console.log(req.query); // { language: "en" }
  console.log(req.params); // { bookId: "1" }
});
```

## IonResponse

```ts
server.on("GET /example", ({ res }: any) => {
  res.headers["Access-Control-Allow-Origin"] = "*";
});
```

## Custom Events

```ts
server.on("foo", (x: number, y: number, z: number) => console.log(x + y + z)); // 6

server.on("GET /bar", () => {
  server.dispatch("foo", 1, 2, 3);
});
```

## Custom Options

```ts
const server = new Server({ host: "127.0.0.0", port: 3000 }); // default 0.0.0.0:8080
```

## Allowed Methods

```ts
server.on("GET /", () => null);
server.on("PUT /", () => null);
server.on("POST /", () => null);
server.on("PATCH /", () => null);
server.on("DELETE /", () => null);
server.on("OPTIONS /", () => null);
```

## Built-in events

```ts
// on server listen
server.on("LISTEN", ({ host, port }: any) => console.log(host, port));

// on request (a.k.a middleware)
server.on("REQ", ({ req, res, onComplete }: any) => console.log(req, res, onComplete) )
```

## Middleware Support

```ts
// cors middleware
server.use(({ res }: any) => {
  res.headers["Access-Control-Allow-Origin"] = "*"
})

// alternative way (preferred)
server.on("REQ", ({ res }: any) => {
  res.headers["Access-Control-Allow-Origin"] = "*"
})

server.on("REQ", ({ onComplete }) => {
  const start - performance.now()
  onComplete(() => {
    const end = performance.now()
    console.log(`RequestTime: ${end - start}ms`)
  })
})
```

## Soon

```ts
// body parser(s)
server.on("POST /book", ({ req }: any) => console.log(req.body));
```
