type EventListener<TArg, TReturn> = (args: TArg) => TReturn | void;

export class Event<TArg, TReturn> {
  listeners: EventListener<TArg, TReturn>[] = [];

  on(listener: EventListener<TArg, TReturn>) {
    this.listeners.push(listener);

    return () => this.off(listener);
  }

  off(listener: EventListener<TArg, TReturn>) {
    const index = this.listeners.findIndex(l => l === listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  emit(args: TArg) {
    return this.listeners.map(l => l(args)).filter(r => r !== undefined) as TReturn[];
  }
}