This document presents the actions available for interacting with the messaging system, which supports both Redis Pub/Sub and Node.js Internal Events.

## Types

The messaging system is divided into two main categories:

- **Messages**: Using Redis Pub/Sub for distributed messaging.
- **Events**: Using Node.js `EventEmitter` for internal application events.

```typescript
export interface triggers {
  event: eventemitter;
  message: actions;
}
```

## Methods (Messages - Redis)

### Ping the messaging. `ping`
The `ping` function is used to verify if the Redis messaging service is available and responding correctly.

**Returns**: A `Promise<string>` resolving to a ping result (usually "PONG").

```typescript
import { messages } from '@infrastructure/messages/actions';

messages.ping()
  .then((result) => console.log('Ping result:', result))
  .catch((error) => console.error('Error:', error));
```

### Publish a message. `pub`
The `pub` function facilitates the publication of a value to a specified Redis topic.

**Parameters**:
- `topic`: The topic (channel) name.
- `value`: The data to be published (will be stringified to JSON).

**Returns**: A `Promise<number>` resolving to the number of subscribers that received the message.

```typescript
import { messages } from '@infrastructure/messages/actions';

messages.pub('user/created', { id: 1, name: 'John Doe' })
  .then((result) => console.log('Message sent to', result, 'subscribers'))
  .catch((error) => console.error('Error:', error));
```

### Subscribe to a topic. `sub`
The `sub` function enables subscription to a designated Redis topic.

**Parameters**:
- `topic`: The topic name (supports patterns like `user/*`).
- `callback`: A function invoked whenever a message is received.

```typescript
import { messages } from '@infrastructure/messages/actions';

messages.sub('user/*', async (message, topic) => {
  console.log(`Received message on topic ${topic}:`, JSON.parse(message));
});
```

---

## Methods (Events - Internal)

### Publish an event. `pub`
Internal events are used for communication between components within the same process.

```typescript
import { events } from '@infrastructure/messages/actions';

events.pub('internal/notification', { message: 'Something happened!' });
```

### Subscribe to an event. `sub`
Subscribe to internal events.

```typescript
import { events } from '@infrastructure/messages/actions';

events.sub('internal/notification', async (data) => {
  console.log('Internal event received:', data);
});
```
