type EventListener<TArg, TReturn> = (args: TArg) => TReturn | void;

export class Event<TArg, TReturn> {
  listeners: EventListener<TArg, TReturn>[] = [];

  on(listener: EventListener<TArg, TReturn>) {
    this.listeners.push(listener);
  }

  emit(args: TArg) {
    return this.listeners.map(l => l(args)).filter(r => r !== undefined) as TReturn[];
  }
}