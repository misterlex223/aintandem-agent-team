# SDK Maintenance Plugin - Implementation Plan

## Overview

Create a Claude Code plugin that automates SDK maintenance for the AInTandem Orchestrator SDK. The plugin adds an "SDK Engineer" agent that handles API changes and generates SDK code and tests.

## User Requirements

| Requirement | Decision |
|-------------|----------|
| Python SDK | Skip for now (TypeScript only) |
| SDK Generation | Mixed mode (types + signatures, manual services) |
| Trigger | Manual trigger (slash command) |
| Tests | Both unit and E2E tests |

## Plugin Structure

```
.claude/plugins/aintandem-sdk-maintenance/
├── plugin.json                      # Plugin manifest
├── README.md                        # Documentation
├── commands/
│   └── update-sdk.ts               # Main command: /update-sdk
├── agents/
│   └── sdk-engineer.agent.ts       # SDK Engineer agent
└── skills/
    ├── openapi-parser.skill.ts     # OpenAPI parsing skill
    └── test-generator.skill.ts     # Test generation skill
```

## Components

### 1. Command: `/update-sdk`

**File**: `.claude/plugins/aintandem-sdk-maintenance/commands/update-sdk.ts`

**Arguments**:
- `--issue <number>`: GitHub issue number with API changelog
- `--spec-url <url>`: Custom OpenAPI spec URL
- `--spec-path <path>`: Local OpenAPI spec path
- `--services <list>`: Comma-separated services to update
- `--no-types`: Skip type generation
- `--no-tests`: Skip test generation
- `--dry-run`: Preview changes without writing

**Usage Examples**:
```bash
/update-sdk --issue 123                    # Full workflow with issue
/update-sdk --spec-url https://...         # Custom spec
/update-sdk --services WorkflowService      # Specific service
/update-sdk --dry-run                       # Preview changes
```

### 2. Agent: SDK Engineer

**File**: `.claude/plugins/aintandem-sdk-maintenance/agents/sdk-engineer.agent.ts`

**Expertise**:
- RESTful API design
- OpenAPI 3.0 specification
- TypeScript type system
- SDK architecture patterns
- WebSocket for real-time updates
- Vitest + MSW testing

**Triggers**:
- User calls `/update-sdk` command
- User mentions "API changes" with SDK files open

**System Prompt**:
- Read GitHub issue "API Changes from ..." for changelog
- Fetch latest openapi.json
- Generate types using openapi-typescript
- Generate service method signatures (preserve manual implementations)
- Generate unit tests (MSW mocks) and E2E tests

### 3. Skills

**openapi-parser.skill.ts**:
- Parse OpenAPI 3.0 specification
- Extract paths, operations, schemas
- Compare old vs new spec to identify changes

**test-generator.skill.ts**:
- Generate Vitest unit tests with MSW handlers
- Generate E2E tests following vitest.e2e.config.ts patterns

## Workflow Steps

```
1. Initialize
   ├─ Parse command arguments
   ├─ Verify clean git state
   └─ Create feature branch (optional)

2. Read GitHub Issue (if --issue provided)
   ├─ Fetch issue by number
   ├─ Parse changelog for breaking changes
   └─ Summarize API changes

3. Fetch OpenAPI Spec
   ├─ Determine source (URL, local, or default)
   ├─ Download/open openapi.json
   └─ Validate spec structure

4. Generate Types
   ├─ Run: pnpm generate-types
   ├─ Verify schema.ts updated
   └─ Parse new types for changes

5. Analyze API Changes
   ├─ Compare paths against existing services
   ├─ Identify new endpoints
   ├─ Identify modified endpoints
   └─ Identify deprecated endpoints

6. Update Service Signatures
   ├─ Generate method signatures from OpenAPI
   ├─ Add/update request/response types
   ├─ Preserve existing implementations
   └─ Add JSDoc with usage examples

7. Generate Tests
   ├─ Unit: MSW handlers for new endpoints
   ├─ Unit: Test cases for new methods
   ├─ E2E: Integration tests
   └─ Update vitest.setup.ts

8. Verification
   ├─ Run: pnpm typecheck
   ├─ Run: pnpm lint
   ├─ Run: pnpm test (unit)
   └─ Report issues

9. Summary
   └─ Display changes, next steps
```

## Critical Files

### Reference Files (Read-Only)

| File | Purpose |
|------|---------|
| `/scripts/generate-types.ts` | Type generation pattern |
| `/packages/core/src/services/WorkflowService.ts` | Service implementation pattern |
| `/packages/core/src/types/index.ts` | Type export pattern |
| `/vitest.setup.ts` | MSW mock pattern |
| `/tests/e2e/sdk-orchestrator.e2e.test.ts` | E2E test pattern |

### Files to Create

| File | Purpose |
|------|---------|
| `.claude/plugins/aintandem-sdk-maintenance/plugin.json` | Plugin manifest |
| `.claude/plugins/aintandem-sdk-maintenance/README.md` | Documentation |
| `.claude/plugins/aintandem-sdk-maintenance/commands/update-sdk.ts` | Command |
| `.claude/plugins/aintandem-sdk-maintenance/agents/sdk-engineer.agent.ts` | Agent |
| `.claude/plugins/aintandem-sdk-maintenance/skills/openapi-parser.skill.ts` | Skill |
| `.claude/plugins/aintandem-sdk-maintenance/skills/test-generator.skill.ts` | Skill |

### Files Modified at Runtime

| File | Modified By | Description |
|------|-------------|-------------|
| `packages/core/src/types/generated/schema.ts` | openapi-typescript | Auto-generated types |
| `packages/core/src/services/*.ts` | Agent | New/updated signatures |
| `packages/core/src/index.ts` | Agent | Export new services |
| `vitest.setup.ts` | Agent | New MSW handlers |
| `tests/e2e/*.e2e.test.ts` | Agent | New E2E tests |

## Code Generation Pattern (Mixed Mode)

**Generated** (automated):
- TypeScript types from OpenAPI
- Method signatures with proper types
- JSDoc comments

**Manual** (preserved):
- HTTP client implementations
- Business logic
- Error handling

**Example Generated Service Method**:
```typescript
/**
 * Create a new resource
 *
 * @param request - Request payload
 * @returns Created resource
 *
 * @example
 * ```typescript
 * const result = await service.createResource({
 *   name: 'Test',
 * });
 * ```
 */
async createResource(request: CreateRequest): Promise<CreateResponse> {
  // [MANUAL IMPLEMENTATION REQUIRED]
  // TODO: Implement HTTP call using this.httpClient
  throw new Error('Not implemented');
}
```

## Verification Steps

1. **Install Plugin**
   ```bash
   # Copy to project plugins directory
   mkdir -p .claude/plugins/aintandem-sdk-maintenance
   # Copy plugin files...

   # Or test locally
   cc --plugin-dir .claude/plugins/aintandem-sdk-maintenance
   ```

2. **Test Command**
   ```bash
   /update-sdk --dry-run
   ```

3. **Verify Generated Code**
   ```bash
   pnpm typecheck  # Should pass
   pnpm lint       # Should pass
   pnpm test       # Unit tests should pass
   ```

4. **End-to-End Test**
   - Create a test GitHub issue with API changes
   - Run `/update-sdk --issue <number>`
   - Verify types generated correctly
   - Verify service signatures updated
   - Verify tests generated
   - Run full test suite

## Implementation Order

1. **Phase 1**: Plugin skeleton (plugin.json, README.md)
2. **Phase 2**: Command implementation (update-sdk.ts)
3. **Phase 3**: Agent development (sdk-engineer.agent.ts)
4. **Phase 4**: Skills (openapi-parser.skill.ts, test-generator.skill.ts)
5. **Phase 5**: Integration testing and refinement
