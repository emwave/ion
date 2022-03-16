// Copyright © 2022 the Ion authors. All rights reserved. MIT license.

export class IonBodyParser {
  constructor(private req: Request) {}

  public async parse(): Promise<null | { [name: string]: any }> {
    if (this.req.body) {
      const contentType = this.req.headers.get("Content-type");

      if (contentType && contentType === "application/json") {
        const reader: ReadableStreamDefaultReader = this.req.body.getReader();
        const buffer = await reader.read();

        if (buffer.value) {
          const decoder = new TextDecoder();

          const text = decoder.decode(buffer.value);

          try {
            return JSON.parse(text);
          } catch (e) {
            console.log(e);
          }
        }
      }
    }

    return null;
  }
}
