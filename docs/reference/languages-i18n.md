---
title: Languages (i18n)
description: Internationalization guide
---

# Languages (i18n)

The project includes a lightweight internationalization system to handle multi-language responses. This is particularly useful for returning error messages or notifications in the user's preferred language.

## Location
The translation files and logic are located in `src/infrastructure/languages/`.

## Translation Files
Currently, the system supports:
- English (`en.json`)
- Spanish (`es.json`)
- Portuguese (`pt.json`) - used as `pt-br` in the code.

### Example JSON (`en.json`)
```json
{
  "ERR_UNAUTHORIZED": "You are not authorized to access this resource.",
  "ERR_NOT_FOUND": "The requested resource was not found."
}
```

## Usage

### Direct Usage
You can import the `translate` function directly.

```typescript
import translate from '@infrastructure/languages/translate';

// Default (English)
const msg = translate('ERR_UNAUTHORIZED'); 

// Specific language
const msgPt = translate('ERR_UNAUTHORIZED', 'pt-br');
```

### Usage within Actions (via Container)
The `container` provided to actions usually has access to the user's language, allowing for seamless translations.

```typescript
export default async function myAction(request: container) {
  // ... logic
  if (error) {
    throw request.badRequest(request.language(), "MY_ERROR_KEY");
  }
}
```

## Fallback Logic
1. If the requested language exists in the dictionary, it looks up the key.
2. If the language is not found, it defaults to the **English** dictionary.
3. If the key is not found in the dictionary, it returns the **key itself** as a fallback string.
