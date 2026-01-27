import EventEmitter from "node:events";
import client from "@infrastructure/cache/connection";

const publisher = client;
const subscriber = client.duplicate();

subscriber.connect().catch(() => {});

class eventsEmitter {
	private emitter = new EventEmitter();
	publish(topic: string, value: string): number {
		const emit = this.emitter.emit(topic, value);
		return emit ? 1 : 0;
	}
	subscribe(topic: string, callback: (snapshot: object, topic?: string) => Promise<void>): void {
		this.emitter.on(topic, async (message) => await callback(message, topic));
	}
}

const eventEmitter = new eventsEmitter();

export { eventEmitter, publisher, subscriber };
