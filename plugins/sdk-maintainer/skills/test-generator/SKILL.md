---
description: Expert knowledge on generating unit tests with MSW (Mock Service Worker) and E2E tests using Vitest for TypeScript SDK projects.
keywords:
  - "test generation"
  - "unit tests"
  - "e2e tests"
  - "vitest"
  - "msw"
  - "mock"
---

# Test Generator

This skill provides knowledge for generating unit tests (with MSW mocks) and E2E tests for the AInTandem SDK.

## Testing Stack

- **Test Framework**: Vitest
- **Mocking**: MSW (Mock Service Worker)
- **Coverage**: Codecov (optional)

## Unit Tests

### File Structure

Place unit tests next to the source file:
```
packages/core/src/services/
├── WorkflowService.ts
└── WorkflowService.test.ts
```

### Test Template

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkflowService } from './WorkflowService';
import { HttpClient } from '../client/HttpClient';
import { mockServer } from '../../../vitest.setup';

describe('WorkflowService', () => {
  let httpClient: HttpClient;
  let service: WorkflowService;

  beforeEach(() => {
    // Create mock HTTP client
    httpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as any;
    service = new WorkflowService(httpClient);
  });

  describe('listWorkflows', () => {
    it('should return workflows array', async () => {
      const mockWorkflows = [
        { id: 'wf-1', name: 'Workflow 1' },
        { id: 'wf-2', name: 'Workflow 2' },
      ];

      vi.mocked(httpClient.get).mockResolvedValue(mockWorkflows);

      const result = await service.listWorkflows();

      expect(httpClient.get).toHaveBeenCalledWith('/workflows');
      expect(result).toEqual(mockWorkflows);
    });

    it('should filter by status', async () => {
      const mockWorkflows = [{ id: 'wf-1', status: 'published' }];

      vi.mocked(httpClient.get).mockResolvedValue(mockWorkflows);

      await service.listWorkflows('published');

      expect(httpClient.get).toHaveBeenCalledWith('/workflows?status=published');
    });

    it('should handle errors', async () => {
      vi.mocked(httpClient.get).mockRejectedValue(
        new Error('Network error')
      );

      await expect(service.listWorkflows()).rejects.toThrow('Network error');
    });
  });

  describe('getWorkflow', () => {
    it('should return a single workflow', async () => {
      const mockWorkflow = { id: 'wf-1', name: 'Test' };

      vi.mocked(httpClient.get).mockResolvedValue(mockWorkflow);

      const result = await service.getWorkflow('wf-1');

      expect(httpClient.get).toHaveBeenCalledWith('/workflows/wf-1');
      expect(result).toEqual(mockWorkflow);
    });
  });

  describe('createWorkflow', () => {
    it('should create a new workflow', async () => {
      const request = { name: 'New Workflow' };
      const mockWorkflow = { id: 'wf-1', ...request };

      vi.mocked(httpClient.post).mockResolvedValue(mockWorkflow);

      const result = await service.createWorkflow(request);

      expect(httpClient.post).toHaveBeenCalledWith('/workflows', request);
      expect(result).toEqual(mockWorkflow);
    });
  });

  describe('updateWorkflow', () => {
    it('should update an existing workflow', async () => {
      const request = { name: 'Updated' };
      const mockWorkflow = { id: 'wf-1', ...request };

      vi.mocked(httpClient.put).mockResolvedValue(mockWorkflow);

      const result = await service.updateWorkflow('wf-1', request);

      expect(httpClient.put).toHaveBeenCalledWith(
        '/workflows/wf-1',
        request
      );
      expect(result).toEqual(mockWorkflow);
    });
  });

  describe('deleteWorkflow', () => {
    it('should delete a workflow', async () => {
      vi.mocked(httpClient.delete).mockResolvedValue(undefined);

      await service.deleteWorkflow('wf-1');

      expect(httpClient.delete).toHaveBeenCalledWith('/workflows/wf-1');
    });
  });
});
```

## MSW Handlers

### Adding MSW Handlers to vitest.setup.ts

```typescript
import { http, HttpResponse } from 'msw';

// Add new handlers to the existing mockServer.use() array

mockServer.use(
  // Existing handlers...

  // New: Workflows endpoints
  http.get('/workflows', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    return HttpResponse.json({
      workflows: [
        {
          id: 'wf-1',
          name: 'Test Workflow 1',
          status: status || 'published',
          definition: { phases: [], transitions: [] },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    });
  }),

  http.get('/workflows/:id', ({ params }) => {
    if (params.id === 'wf-1') {
      return HttpResponse.json({
        id: 'wf-1',
        name: 'Test Workflow 1',
        status: 'published',
        definition: { phases: [], transitions: [] },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
    }

    return HttpResponse.json(
      { error: 'Workflow not found' },
      { status: 404 }
    );
  }),

  http.post('/workflows', async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      id: 'wf-new',
      ...body,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  http.put('/workflows/:id', async ({ request, params }) => {
    const body = await request.json();

    return HttpResponse.json({
      id: params.id,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  http.delete('/workflows/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),
);
```

### Response Patterns

| Scenario | Response |
|----------|----------|
| Success (single) | `HttpResponse.json({ id: '...', ... })` |
| Success (array) | `HttpResponse.json({ items: [...] })` |
| Success (no content) | `new HttpResponse(null, { status: 204 })` |
| Not found | `HttpResponse.json({ error: '...' }, { status: 404 })` |
| Bad request | `HttpResponse.json({ error: '...' }, { status: 400 })` |
| Server error | `HttpResponse.json({ error: '...' }, { status: 500 })` |

## E2E Tests

### File Structure

E2E tests go in the `tests/e2e/` directory:
```
tests/e2e/
├── sdk-orchestrator.e2e.test.ts
└── workflow-service.e2e.test.ts
```

### E2E Test Template

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { AInTandemClient } from '@aintandem/sdk-core';

describe('WorkflowService E2E', () => {
  let client: AInTandemClient;

  beforeAll(() => {
    // Initialize with test credentials
    client = new AInTandemClient({
      apiKey: process.env.TEST_API_KEY || 'test-key',
      baseUrl: process.env.TEST_BASE_URL || 'http://localhost:9900',
    });
  });

  describe('listWorkflows', () => {
    it('should return workflows from real API', async () => {
      const workflows = await client.workflows.listWorkflows();

      expect(Array.isArray(workflows)).toBe(true);
      expect(workflows.length).toBeGreaterThanOrEqual(0);
    }, { timeout: 10000 });

    it('should filter by status', async () => {
      const published = await client.workflows.listWorkflows('published');

      expect(Array.isArray(published)).toBe(true);
      published.forEach(wf => {
        expect(wf.status).toBe('published');
      });
    }, { timeout: 10000 });
  });

  describe('createWorkflow', () => {
    it('should create a new workflow', async () => {
      const workflow = await client.workflows.createWorkflow({
        name: 'E2E Test Workflow',
        description: 'Created during E2E test',
        definition: {
          phases: [],
          transitions: [],
        },
      });

      expect(workflow).toBeDefined();
      expect(workflow.id).toBeDefined();
      expect(workflow.name).toBe('E2E Test Workflow');
    }, { timeout: 10000 });
  });

  describe('getWorkflow', () => {
    it('should fetch a workflow by ID', async () => {
      // First create a workflow
      const created = await client.workflows.createWorkflow({
        name: 'Get Test Workflow',
        definition: { phases: [], transitions: [] },
      });

      // Then fetch it
      const fetched = await client.workflows.getWorkflow(created.id);

      expect(fetched.id).toBe(created.id);
      expect(fetched.name).toBe('Get Test Workflow');
    }, { timeout: 10000 });
  });
});
```

## Test Naming Conventions

| Pattern | Example |
|---------|---------|
| Describe block | `describe('MethodName', () => {})` |
| Success test | `it('should return expected result', ...)` |
| Error test | `it('should handle errors', ...)` |
| Edge case | `it('should handle empty array', ...)` |

## Test Coverage Goals

Aim for:
- **100%** coverage on generated code (types, interfaces)
- **80%+** coverage on service methods
- **All** error paths tested
- **All** edge cases tested

## Running Tests

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run E2E tests only
pnpm test:e2e

# Run with coverage
pnpm test:coverage

# Run specific file
pnpm test WorkflowService.test.ts
```

---

This skill provides the foundation for generating comprehensive tests for the SDK.
