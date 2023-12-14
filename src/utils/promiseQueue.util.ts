class PromiseQueueItem {
  callback: Function;
  params: any[];
  resolver!: (value: unknown) => void;

  constructor(callback: Function, resolver: (value: unknown) => void, params: any[]) {
    this.callback = callback;
    this.params = params;
    this.resolver = resolver;
  }

  async resolveItem() {
    const result = await this.callback(...this.params);
    this.resolver(result);
  }
}

export class PromiseQueue {
  private name: string;
  private queue: PromiseQueueItem[] = [];
  private isExecuting: boolean = false;

  constructor(name: string) {
    this.name = name;
  }

  async resolveNext(): Promise<any> {
    if (this.isExecuting) {
      return;
    }
    this.isExecuting = true;
    while (this.queue.length > 0) {
      const queueItem = this.queue.shift();
      await queueItem?.resolveItem();
    }
    this.isExecuting = false;
  }

  add(callback: any, params: any[] = []) {
    return new Promise(resolve => {
      this.queue.push(new PromiseQueueItem(callback, resolve, params));
      this.resolveNext();
    });
  }
}
