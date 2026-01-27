import { eventEmitter, publisher, subscriber } from "./connections";
import type { default as triggers } from "./interface";

export const messages: triggers["message"] = {
	ping: async () => (subscriber.isOpen ? await subscriber.ping() : "PONG"),
	pub: async (topic, value) => {
		if (publisher.isOpen) return await publisher.publish(topic, JSON.stringify(value));
		return events.pub(topic, value as object);
	},
	sub: async (topic, callback) => {
		if (subscriber.isOpen) return await subscriber.subscribe(topic, callback);
		return events.sub(topic, callback);
	},
	unsub: async (topic, callback) => {
		if (subscriber.isOpen) return await subscriber.unsubscribe(topic, callback);
		return;
	},
};

export const events: triggers["event"] = {
	pub: (topic, value) => eventEmitter.publish(topic, JSON.stringify(value)),
	sub: (topic, callback) => eventEmitter.subscribe(topic, callback),
};
