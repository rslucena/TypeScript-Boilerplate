This document presents the available actions for interacting with the cache system.

## Types:
```typescript
export interface actions {
  text: functions
  json: functions
  ping: () => Promise<string>
}
```

## Methods:
```typescript
set: (hash: string, vals: any, ttl?: number, key?: string) => Promise<string | null>
get: (hash: string, Force?: boolean) => Promise<any | null>
del: (hash: string) => Promise<number>
```

### Pings the cache. `ping`
The ping function is commonly used in cache systems to verify if the cache service is available and responding correctly.
When an application relies on the cache to store and retrieve data, it's essential to ensure the cache service is operational. The ping function allows the application to send a simple request to the cache service and receive a response back. If the response is successfully received, the application can infer that the cache service is functioning correctly.

Returns: A Promise resolving to a ping result string.

```typescript
import cache from '@infrastructure/cache/actions';

cache.ping()
  .then((result) => console.log('Ping result:', result))
  .catch((error) => console.error('Error:', error));
```

### Stores data in the cache. `set`
The set function is essential in cache systems as it enables storing data with specified keys for efficient retrieval. By utilizing set, applications can optimize data access by caching frequently accessed or expensive-to-calculate data, enhancing overall system performance.

Parameters:
- `hash`: The key for the cache entry.
- `vals`: The value to be stored in the cache.
- `ttl` (optional): Time to live for the cache entry.
- `key` (optional): Additional key for the cache entry.

Returns: A Promise resolving to a confirmation string or null on error.

```typescript
import cache from '@infrastructure/cache/actions';

// Type: Text
cache.text.set('key', 'value', 3600)
  .then((result) => console.log('Set result:', result))
  .catch((error) => console.error('Error:', error));

// Type: JSON
cache.json.set('json_key', { key: 'value' }, 3600)
  .then((result) => console.log('Set result:', result))
  .catch((error) => console.error('Error:', error));
```

### Retrieves values from the cache. `get`
The `get` function in cache systems retrieves stored data based on specified keys. This reduces the need for expensive database queries or computations.

**Parameters**:
- `hash`: The key for the cache entry.

**Returns**: A `Promise` resolving to the cached value or `null` if not found.

```typescript
import cache from '@infrastructure/cache/actions';

// Type: Text
cache.text.get('key')
  .then((value) => console.log('Value:', value))
  .catch((error) => console.error('Error:', error));

// Type: JSON
cache.json.get<MyType>('json_key')
  .then((value) => console.log('Value:', value))
  .catch((error) => console.error('Error:', error));
```

### Deletes values from the cache. `del`
The `del` function removes data entries based on provided keys. It returns a promise resolving to the number of deleted entries.

**Parameters**:
- `hash`: The key for the cache entry (supports patterns like `user/*`).

**Returns**: A `Promise<number>` resolving to the number of deleted entries.

```typescript
import cache from '@infrastructure/cache/actions';

// Type: Text
cache.text.del('key')
  .then((result) => console.log('Delete result:', result))
  .catch((error) => console.error('Error:', error));

// Type: JSON
cache.json.del('json_key')
  .then((result) => console.log('Delete result:', result))
  .catch((error) => console.error('Error:', error));
```