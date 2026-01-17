---
description: Expert knowledge on parsing OpenAPI 3.0 specifications, extracting API endpoints, and comparing OpenAPI specs to identify changes for SDK generation.
keywords:
  - "openapi"
  - "swagger"
  - "api spec"
  - "endpoint parsing"
  - "openapi schema"
---

# OpenAPI Parser

This skill provides knowledge for parsing and analyzing OpenAPI 3.0 specifications to support SDK code generation.

## OpenAPI 3.0 Structure

An OpenAPI 3.0 spec has this structure:

```json
{
  "openapi": "3.0.x",
  "info": { "title": "...", "version": "..." },
  "servers": [{ "url": "..." }],
  "paths": {
    "/workflows": {
      "get": {
        "summary": "List workflows",
        "operationId": "listWorkflows",
        "parameters": [...],
        "responses": { "200": { ... } }
      },
      "post": { ... }
    },
    "/workflows/{id}": { ... }
  },
  "components": {
    "schemas": { ... },
    "requestBodies": { ... },
    "responses": { ... }
  }
}
```

## Key Concepts

### Paths and Operations

- **Path**: URL template like `/workflows/{id}`
- **Operation**: HTTP method (get, post, put, patch, delete)
- **Operation ID**: Unique identifier for the operation
- **Parameters**: Path parameters, query parameters, headers
- **Request Body**: POST/PUT/PATCH payload schema
- **Responses**: Response schemas by status code

### Schema Types

Common schema types:
- `string` (with format: date-time, uuid, etc.)
- `number`, `integer`
- `boolean`
- `array` (with items)
- `object` (with properties)

### Grouping Paths to Services

Map URL patterns to service classes:

| URL Pattern | Service Class |
|-------------|---------------|
| `/workflows/*` | WorkflowService |
| `/tasks/*` | TaskService |
| `/sandboxes/*` | SandboxService |
| `/containers/*` | ContainerService |
| `/contexts/*` | ContextService |
| `/settings/*` | SettingsService |
| `/workspaces/*` | WorkspaceService |
| `/organizations/*` | OrganizationService |
| `/projects/*` | ProjectService |
| `/auth/*` | AuthService |

## Extracting Operations

For each path and operation, extract:

1. **Method name**: Convert operationId or path to camelCase
   - `listWorkflows` → `listWorkflows()`
   - `/workflows/{id}` (GET) → `getWorkflow()`
   - `/workflows` (POST) → `createWorkflow()`

2. **Request type**: Based on parameters + requestBody
   - Path parameters → method parameters
   - Query parameters → optional method parameter
   - Request body → method parameter

3. **Response type**: Based on success response schema

## Comparing Specs

To identify changes between two OpenAPI specs:

### New Endpoints

Paths or operations in new spec but not in old:
```typescript
function findNewEndpoints(oldSpec: OpenAPI, newSpec: OpenAPI) {
  const newEndpoints: Endpoint[] = [];

  for (const [path, methods] of Object.entries(newSpec.paths)) {
    if (!oldSpec.paths[path]) {
      // Entire path is new
      for (const [method, operation] of Object.entries(methods)) {
        newEndpoints.push({ path, method, operation });
      }
    } else {
      // Check for new operations on existing path
      for (const [method, operation] of Object.entries(methods)) {
        if (!oldSpec.paths[path][method]) {
          newEndpoints.push({ path, method, operation });
        }
      }
    }
  }

  return newEndpoints;
}
```

### Modified Endpoints

Operations with changed request/response schemas:
```typescript
function findModifiedEndpoints(oldSpec: OpenAPI, newSpec: OpenAPI) {
  const modified: Endpoint[] = [];

  for (const [path, methods] of Object.entries(newSpec.paths)) {
    if (oldSpec.paths[path]) {
      for (const [method, operation] of Object.entries(methods)) {
        const oldOperation = oldSpec.paths[path][method];
        if (oldOperation) {
          // Compare schemas
          if (!deepEqual(oldOperation, operation)) {
            modified.push({ path, method, operation });
          }
        }
      }
    }
  }

  return modified;
}
```

### Deprecated Endpoints

Paths or operations in old spec but not in new:
```typescript
function findDeprecatedEndpoints(oldSpec: OpenAPI, newSpec: OpenAPI) {
  const deprecated: Endpoint[] = [];

  for (const [path, methods] of Object.entries(oldSpec.paths)) {
    if (!newSpec.paths[path]) {
      // Entire path removed
      for (const [method] of Object.entries(methods)) {
        deprecated.push({ path, method });
      }
    } else {
      // Check for removed operations
      for (const [method] of Object.entries(methods)) {
        if (!newSpec.paths[path][method]) {
          deprecated.push({ path, method });
        }
      }
    }
  }

  return deprecated;
}
```

## Type Mapping

Map OpenAPI schema types to TypeScript types:

| OpenAPI Type | TypeScript Type |
|--------------|-----------------|
| `string` | `string` |
| `string (format: date-time)` | `string` (ISO date) |
| `string (format: uuid)` | `string` |
| `number` | `number` |
| `integer` | `number` |
| `boolean` | `boolean` |
| `array` | `T[]` |
| `object` | Interface with properties |
| `$ref` | Imported type |
| `oneOf`, `anyOf`, `allOf` | Union type |
| `enum` | Enum or union of literals |

## Breaking Changes

Common breaking changes to detect:

1. **Required fields added**: A required property added to request schema
2. **Type changes**: Field type changed incompatibly
3. **Enum values added/reduced**: Changed enum options
4. **Removed fields**: Property removed from schema
5. **Path changes**: URL template changed
6. **Method changes**: HTTP method changed for operation

## Validation

Validate an OpenAPI spec:

1. Check `openapi` version is 3.0.x
2. Check required fields: `info`, `paths`
3. Check all paths have at least one operation
4. Check all operations have `responses`
5. Check all `$ref` references exist in `components`

## Tools and Utilities

Use these tools when working with OpenAPI:

1. **Fetch spec**: Use `fetch` or `Read` tool
2. **Parse JSON**: Native JSON parsing
3. **Validate**: Use openapi-typescript for validation
4. **Compare**: Deep equality checks between specs
5. **Extract types**: Use openapi-typescript for TypeScript generation

---

This skill provides the foundation for parsing OpenAPI specs and identifying changes to drive SDK code generation.
