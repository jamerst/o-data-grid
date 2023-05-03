type EventListener<T> = (args: T) => void;

export class Event<T> {
  listeners: EventListener<T>[] = [];

  on(listener: EventListener<T>) {
    this.listeners.push(listener);
  }

  emit(args: T) {
    for (const listener of this.listeners) {
      listener(args);
    }
  }
}