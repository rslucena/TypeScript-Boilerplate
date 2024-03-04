import { eventEmitter, publisher, subscriber } from './connections'
import { default as messages, default as triggers } from './interface'

const message: triggers['messages'] = {
  ping: async () => await subscriber.ping(),
  pub: async (topic, value) => await publisher.publish(topic, JSON.stringify(value)),
  sub: async (topic, callback) => await subscriber.pSubscribe(topic, callback),
}

const event: triggers['events'] = {
  pub: (topic, value) => eventEmitter.publish(topic, JSON.stringify(value)),
  sub: (topic, callback) => eventEmitter.subscribe(topic, callback),
}

const queues: messages = {
  messages: message,
  events: event,
}

export default queues
