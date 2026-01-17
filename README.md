# AInTandem Agent Team

Collection of specialized Claude Code plugins for AInTandem development workflows.

## Installation

Add this marketplace to Claude Code:

```bash
/plugin marketplace add /Users/lex.yang/RD/aintandem/default/aintandem-agent-team
```

## Available Plugins

### SDK Maintainer

Automates SDK maintenance for the AInTandem Orchestrator SDK.

- **Command**: `/update-sdk` - Handle API changes from OpenAPI specs
- **Agent**: `sdk-engineer` - Expert in RESTful API design and TypeScript
- **Skills**: OpenAPI parser, test generator

#### Installation

```bash
/plugin install sdk-maintainer@aintandem-agent-team
```

#### Usage

```bash
# Update from GitHub issue
/update-sdk --issue 123

# Preview changes without writing
/update-sdk --dry-run

# Update specific services
/update-sdk --services WorkflowService,SessionService
```

## Development

This is a monorepo for AInTandem agent plugins. More agents will be added over time.

## Structure

```
aintandem-agent-team/
├── .claude-plugin/
│   └── marketplace.json
├── plugins/
│   └── sdk-maintainer/
└── plans/
    └── sdk-maintenance-plugin.md
```

## License

MIT
