import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";
import Logs from "@infrastructure/logs/handler";
import { messages } from "@infrastructure/messages/actions";
import { type RawData, type WebSocket, WebSocketServer } from "ws";
import authentication from "./authentication";
import { container } from "./interface";
import { safeParse } from "./transforms";

type payload = { action: string; session: string; context: string };
type client = { link: WebSocket; authenticated: boolean };

const topics: Map<string, Set<string>> = new Map();
const clients: Map<string, client> = new Map();
const logger = Logs.handler("websocket");

export default function websocket(Params: WebSocketServer["options"]) {
	const ws = new WebSocketServer({ ...Params, host: "0.0.0.0" });
	ws.on("close", () => logger.error("websocket closed"));
	ws.on("error", () => logger.error("websocket error"));
	ws.on("listening", () => logger.info(`websocket listening ${JSON.stringify(ws.address())}`));
	ws.on("headers", (headers) => logger.info(`websocket headers received: ${headers}`));
	ws.on("connection", (link, request) => connection(link, request));
	return ws;
}

function connection(link: WebSocket, request: IncomingMessage) {
	const ip = request.socket.remoteAddress ?? randomUUID();
	const id = Buffer.from(ip).toString("base64");
	clients.set(id, { link, authenticated: false });

	const heartbeat = setInterval(() => {
		const client = clients.get(id);
		const invalid = client === undefined || !client.authenticated;
		if (invalid) return disconnect(id);
		client.link.ping();
	}, 30000);

	link.send(mstart);
	link.send(JSON.stringify({ ...msession, session: id }));

	link.on("error", () => disconnect(id));
	link.on("close", () => clearInterval(heartbeat));
	link.on("unexpected-response", () => disconnect(id));
	link.on("message", (data) => message(id, data));
}

async function message(id: string, data: RawData) {
	const client = clients.get(id);
	const decoded = safeParse(data.toString());
	if (!decoded || !client) return disconnect(id);

	const { action, context, session } = decoded as payload;
	if (!action || !context || !session) disconnect(id);
	if (session !== id) disconnect(id);

	switch (action) {
		case "authorization":
			client.authenticated = await credentials(context);
			if (!client.authenticated) return client.link.send(insession);
			return client.link.send(authenticated);

		case "subscribe": {
			const subscribed = await subscribe(id, context, client.authenticated);
			if (subscribed) return client.link.send(msubscribe);
			client.link.send(insession);
			return disconnect(id);
		}

		case "unsubscribe": {
			const deleted = await unsubscribe(id, context, client.authenticated);
			if (deleted) return client.link.send(munsubscribe);
			client.link.send(insession);
			return disconnect(id);
		}

		default:
			disconnect(id);
	}
}

async function disconnect(id: string) {
	for (const [topic, connected] of topics.entries()) {
		if (connected.has(id)) connected.delete(id);
		if (connected.size === 0) {
			await messages.unsub(topic);
			topics.delete(topic);
		}
	}
	const client = clients.get(id);
	if (!client) return;
	client.link.send(mdisconnect);
	client.link.close();
	clients.delete(id);
}

async function credentials(content: string) {
	const receiver = new container({ headers: { authorization: `Bearer ${content}` } });
	return await new authentication().session(receiver);
}

async function subscribe(id: string, topic: string, authenticated: boolean) {
	if (!authenticated) return undefined;
	if (!topics.has(topic)) {
		await messages.sub(topic, broadcast);
		topics.set(topic, new Set<string>());
	}
	return topics.get(topic)?.add(id);
}

async function unsubscribe(id: string, topic: string, authenticated: boolean) {
	if (!authenticated) return undefined;
	const subscribers = topics.get(topic);
	if (!subscribers) return true;

	const deleted = subscribers.delete(id);
	if (subscribers.size === 0) {
		await messages.unsub(topic);
		topics.delete(topic);
	}
	return deleted;
}

async function broadcast(snapshot: unknown, topic?: string) {
	if (!topic || !topics.has(topic)) return;
	const message = JSON.stringify({ action: "message", topic, snapshot });
	const subscribers = topics.get(topic);
	if (subscribers) {
		for (const id of subscribers) {
			const client = clients.get(id);
			if (client && client.link.readyState === 1) client.link.send(message);
		}
	}
}

const mstart = JSON.stringify({ action: "connect", message: "connection established" });
const mdisconnect = JSON.stringify({ action: "connect", message: "client disconnect" });
const msession = { action: "session", message: "waiting for create session" };
const insession = JSON.stringify({ action: "session", message: "session unauthorized" });
const authenticated = JSON.stringify({ action: "session", message: "session authenticated" });
const msubscribe = JSON.stringify({ action: "subscribe", message: "context subscribed" });
const munsubscribe = JSON.stringify({ action: "unsubscribe", message: "context unsubscribed" });
