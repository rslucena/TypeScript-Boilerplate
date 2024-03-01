import { publisher, subscriber } from './connections'
import messages from './interface'

const queues: messages['redis'] = {
  ping: async () => await subscriber.ping(),
  pub: async (topic, value) => await publisher.publish(topic, JSON.stringify(value)),
  sub: async (topic, callback) => await subscriber.pSubscribe(topic, callback),
}

export default queues
