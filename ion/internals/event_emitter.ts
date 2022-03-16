// Copyright © 2022 the Ion authors. All rights reserved. MIT license.

export class IonEventEmitter {
  private _eventTarget: EventTarget;
  private _eventDispatchArgs: { [name: string]: any[] };

  constructor() {
    this._eventTarget = new EventTarget();
    this._eventDispatchArgs = {};
  }

  public on<F extends Function>(type: string, cb: F) {
    const dispatchArgs = this._eventDispatchArgs;

    this._eventTarget.addEventListener(type, () => {
      cb.call(null, ...dispatchArgs[type]);
    });
  }

  public dispatch(type: string, ...args: any[]) {
    this._eventDispatchArgs[type] = args;
    this._eventTarget.dispatchEvent(new Event(type));
  }
}
