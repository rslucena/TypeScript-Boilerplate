import { eventEmitter, publisher, subscriber } from './connections'
import { default as triggers } from './interface'

export const messages: triggers['message'] = {
  ping: async () => await subscriber.ping(),
  pub: async (topic, value) => await publisher.publish(topic, JSON.stringify(value)),
  sub: async (topic, callback) => await subscriber.pSubscribe(topic, callback),
}

export const events: triggers['event'] = {
  pub: (topic, value) => eventEmitter.publish(topic, JSON.stringify(value)),
  sub: (topic, callback) => eventEmitter.subscribe(topic, callback),
}
