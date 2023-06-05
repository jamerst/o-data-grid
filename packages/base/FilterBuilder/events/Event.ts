type EventListener<TArg> = (args: TArg) => void;

export class Event<TArg> {
  listeners: EventListener<TArg>[] = [];

  on(listener: EventListener<TArg>) {
    this.listeners.push(listener);

    return () => this.off(listener);
  }

  off(listener: EventListener<TArg>) {
    const index = this.listeners.findIndex(l => l === listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  emit(args: TArg) {
    this.listeners.forEach(l => l(args));
  }
}