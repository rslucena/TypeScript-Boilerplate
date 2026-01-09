---
description: How to create a new complete CRUD domain in the project
---

If the user asks to create a new "domain", "entity", or "CRUD module", follow this flow:

1. **Automatic Generation**:
   Run the integrated generator command:
   ```bash
   bun gen:domain <singular_name>
   ```
   *Example: `bun gen:domain product`*

2. **Entity Customization**:
   Open `src/domain/<name>/entity.ts` and add the necessary columns as requested by the user.

3. **Schema Adjustment**:
   Update `src/domain/<name>/schema.ts` to reflect the new columns in Zod validation (create, update, read).

4. **Database Migration**:
   Always suggest or execute migration generation after changing the entity:
   ```bash
   bun db:migrate
   ```

5. **Verification**:
   Run the generated tests to ensure the basic structure is working:
   ```bash
   bun test tests/unit/domain/<name>/crud.spec.ts
   ```

// turbo
6. **Formatting**:
   The generator already runs the formatter, but it is good practice to ensure everything is okay:
   ```bash
   bun biome format --write .
   ```
