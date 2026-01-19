---
title: Logs Actions Reference
description: Logging API reference
---

# Logs Actions Reference

This document presents the actions available for interacting with the logs system.

## Types
- **file** _Using the Pino_
- **console** _Using the Node:console_
- **provider** _Access to the Pino provider directly_

## Methods: 
```typescript
  error: (message: string, props: Error | any, exit?: boolean) => void
  warn: (props: any, message?: string) => void
  info: (props: any) => void
  debug: (props: any, exit?: boolean) => void
```

> All files are saved in the /temp/logs folder

### Log an error. `error`
The error function makes it easy to publish a specific Error record.

Parameters:

- `message`: the message to be recorded.
- `props`: to additional properties to the registration event.
- `exit`: whether the event should also send a closing signal to the process

```typescript
import Logs from '@infrastructure/logs/handler';

Logs.file.error('message err', { var: 'var' }, false)
Logs.console.error('message err', { var: 'var' }, false)
```

### Log an warning. `warn`
The warn function makes it easy to publish a specific Warning record.

Parameters:

- `message`: the message to be recorded.
- `props`: to additional properties to the registration event.

```typescript
import Logs from '@infrastructure/logs/handler';

Logs.file.warn({ var: 'var' }, 'message err')
Logs.console.warn({ var: 'var' }, 'message err')

```

### Log an information. `info`
The info function makes it easy to publish a specific information record.

Parameters:

- `message`: the message to be recorded.
- `props`: to additional properties to the registration event.

```typescript
import Logs from '@infrastructure/logs/handler';

Logs.file.info({ var: 'var' })
Logs.console.info({ var: 'var' })

```

### Log an debug. `debug`
The debug function makes it easy to publish a specific debug record.

Parameters:

- `message`: the message to be recorded.
- `props`: to additional properties to the registration event.

```typescript
import Logs from '@infrastructure/logs/handler';

Logs.file.debug({ var: 'var' }, true)
Logs.console.debug({ var: 'var' }, false)

```