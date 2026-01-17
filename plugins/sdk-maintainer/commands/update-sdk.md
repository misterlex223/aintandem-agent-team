---
name: update-sdk
description: Trigger the SDK maintenance workflow to update the SDK based on API changes from OpenAPI spec and GitHub issues.
argument-hint: "[options]"
allowed-tools: [Read, Write, Bash, Glob, Grep, AskUserQuestion]
---

# SDK Update Command

You are executing the `/update-sdk` command for the AInTandem SDK maintenance workflow.

## Command Arguments

Parse the following arguments from the user input:

| Argument | Description |
|----------|-------------|
| `--issue <number>` | GitHub issue number with API changelog |
| `--spec-url <url>` | Custom OpenAPI spec URL |
| `--spec-path <path>` | Local OpenAPI spec path |
| `--services <list>` | Comma-separated services to update |
| `--no-types` | Skip type generation |
| `--no-tests` | Skip test generation |
| `--dry-run` | Preview changes without writing |

## Workflow Steps

Follow this workflow to update the SDK:

### Step 1: Initialize

1. Parse command arguments from user input
2. Verify git working directory is clean (or warn user)
3. If `--dry-run`, notify user that no files will be written

### Step 2: Read GitHub Issue (if `--issue` provided)

1. Use `gh issue view <number>` to fetch issue details
2. Parse the issue body for changelog information
3. Identify breaking changes and new endpoints
4. Summarize the API changes to the user

### Step 3: Fetch OpenAPI Spec

Determine the OpenAPI spec source in this order:
1. `--spec-url` argument (if provided)
2. `--spec-path` argument (if provided)
3. `OPENAPI_SPEC_URL` environment variable
4. Default: https://aintandem.github.io/orchestrator-api/openapi.json
5. Fallback: local `orchestrator/dist/swagger.json`

Fetch and validate the OpenJSON spec structure.

### Step 4: Generate Types (unless `--no-types`)

1. Run `pnpm generate-types` (or `npx openapi-typescript` directly)
2. Verify `packages/core/src/types/generated/schema.ts` was updated
3. Parse the new types to identify changes

### Step 5: Analyze API Changes

Compare the new OpenAPI spec against existing services:
1. List all paths in the OpenAPI spec
2. Group by service (e.g., `/workflows/*` → WorkflowService)
3. Identify:
   - **New endpoints**: Paths not in existing services
   - **Modified endpoints**: Paths with changed request/response types
   - **Deprecated endpoints**: Paths removed from OpenAPI

### Step 6: Update Service Signatures

For each affected service:

1. **Generate method signature** from OpenAPI operation:
   ```typescript
   async methodName(params: RequestType): Promise<ResponseType> {
     // [MANUAL IMPLEMENTATION REQUIRED]
     // TODO: Implement HTTP call using this.httpClient
     throw new Error('Not implemented');
   }
   ```

2. **Add JSDoc comment** with:
   - Brief description
   - `@param` tags for parameters
   - `@returns` tag for return type
   - `@example` usage block

3. **Preserve existing implementations**:
   - If the method already exists, keep the body
   - Only update type signatures if they changed
   - Add `@deprecated` comments if endpoint is deprecated

### Step 7: Generate Tests (unless `--no-tests`)

**Unit Tests**:
1. Add MSW handlers to `vitest.setup.ts` for new endpoints
2. Create test files following pattern: `<service>.test.ts`
3. Include success and error test cases

**E2E Tests**:
1. Add tests to `tests/e2e/` following `sdk-orchestrator.e2e.test.ts` pattern
2. Test against real API when available

### Step 8: Verification

Run these checks and report results:
1. `pnpm typecheck` - TypeScript compilation
2. `pnpm lint` - Code style checks
3. `pnpm test` - Unit tests

### Step 9: Summary

Provide a summary including:
- Files created
- Files modified
- Types added/changed
- Services updated
- Tests added
- Any issues found during verification
- Suggested next steps (run E2E tests, create PR, etc.)

## Reference Files

When implementing, reference these files for patterns:

- **Type generation**: `/scripts/generate-types.ts`
- **Service pattern**: `/packages/core/src/services/WorkflowService.ts`
- **Type exports**: `/packages/core/src/types/index.ts`
- **MSW mocks**: `/vitest.setup.ts`
- **E2E tests**: `/tests/e2e/sdk-orchestrator.e2e.test.ts`

## Important Notes

- Follow the **mixed-mode approach**: generate signatures but preserve manual implementations
- Always use `this.httpClient.get/post/put/delete` for HTTP calls
- Export new types from `packages/core/src/types/index.ts`
- Export new services from `packages/core/src/index.ts`
- If `--dry-run` is set, show what would be changed but don't write files

## Example Usage

User input:
```
/update-sdk --issue 42
```

Your response should guide through the workflow, showing progress at each step.

---

Now execute the `/update-sdk` command based on the user's arguments.
