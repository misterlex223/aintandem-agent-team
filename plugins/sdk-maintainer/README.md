# AInTandem SDK Maintenance Plugin

Automates SDK maintenance for the AInTandem Orchestrator SDK.

## Features

- **OpenAPI Integration**: Fetches and parses OpenAPI specifications
- **Type Generation**: Automatically generates TypeScript types from OpenAPI
- **Service Updates**: Generates service method signatures based on API changes
- **Test Generation**: Creates unit tests (with MSW mocks) and E2E tests
- **GitHub Integration**: Reads changelog from GitHub issues

## Usage

### Command: `/update-sdk`

Triggers the SDK update workflow.

```bash
# Full workflow with GitHub issue
/update-sdk --issue 123

# With custom OpenAPI spec URL
/update-sdk --spec-url https://api.example.com/openapi.json

# Update specific services only
/update-sdk --services WorkflowService,TaskService

# Dry run to preview changes
/update-sdk --dry-run

# Skip type generation
/update-sdk --no-types

# Skip test generation
/update-sdk --no-tests
```

### Arguments

| Argument | Description |
|----------|-------------|
| `--issue <number>` | GitHub issue number containing API changelog |
| `--spec-url <url>` | Custom OpenAPI spec URL |
| `--spec-path <path>` | Local path to OpenAPI spec |
| `--services <list>` | Comma-separated list of services to update |
| `--no-types` | Skip type generation |
| `--no-tests` | Skip test generation |
| `--dry-run` | Preview changes without writing files |

## Components

### SDK Engineer Agent

An autonomous agent that specializes in:

- RESTful API design and HTTP semantics
- OpenAPI 3.0 specification parsing
- TypeScript type system and code generation
- SDK architecture patterns
- WebSocket for real-time updates
- Test-driven development (Vitest, MSW mocking)

The agent follows a **mixed-mode approach**:
- **Generated**: TypeScript types, method signatures, JSDoc comments
- **Manual**: HTTP implementations, business logic, error handling

### Skills

1. **OpenAPI Parser** (`openapi-parser.skill.ts`)
   - Parses OpenAPI 3.0 specifications
   - Extracts paths, operations, and schemas
   - Compares old vs new specs to identify changes

2. **Test Generator** (`test-generator.skill.ts`)
   - Generates Vitest unit tests with MSW handlers
   - Generates E2E tests following project patterns

## Workflow

1. **Initialize**: Parse arguments, verify git state
2. **Read Issue**: Fetch GitHub issue changelog (if provided)
3. **Fetch Spec**: Download/open OpenAPI specification
4. **Generate Types**: Run `pnpm generate-types`
5. **Analyze Changes**: Compare new API against existing services
6. **Update Services**: Generate new/updated method signatures
7. **Generate Tests**: Create unit and E2E tests
8. **Verify**: Run typecheck, lint, and tests
9. **Summary**: Display changes and next steps

## Files Modified

| File | Description |
|------|-------------|
| `packages/core/src/types/generated/schema.ts` | Auto-generated types |
| `packages/core/src/services/*.ts` | Service signatures |
| `packages/core/src/index.ts` | Service exports |
| `vitest.setup.ts` | MSW mock handlers |
| `tests/e2e/*.e2e.test.ts` | E2E tests |

## Development

The plugin is located at `.claude/plugins/aintandem-sdk-maintenance/`.

To test locally:
```bash
cc --plugin-dir .claude/plugins/aintandem-sdk-maintenance
```

## License

MIT
