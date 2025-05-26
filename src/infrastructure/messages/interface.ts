interface actions {
	ping: () => Promise<string>;
	sub(topic: string, callback: (snapshot: unknown, topic?: string) => Promise<void>): Promise<void>;
	pub(topic: string, value: CallableFunction): Promise<undefined | number>;
}

interface eventemitter {
	sub(topic: string, callback: (snapshot: object, topic?: string) => Promise<void>): void;
	pub(topic: string, value: object): number;
}

interface triggers {
	event: eventemitter;
	message: actions;
}

export default triggers;
