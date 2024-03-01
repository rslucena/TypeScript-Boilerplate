import client from '@infrastructure/cache/connection'

const publisher = client

const subscriber = client.duplicate()
await subscriber.connect()

export { publisher, subscriber }
