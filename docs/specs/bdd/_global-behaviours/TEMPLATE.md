# Global Behaviour: [Behaviour Name]

**Feature ID**: GB-[CATEGORY]-XXX  
**Category**: [e.g., Server, CLI, Config]  
**Priority**: [Critical/High/Medium/Low]  
**Status**: [📋 Planned / ✅ Implemented]

## Description

[1-2 sentence description of the global behaviour and its purpose.]

**Applies To:**

- All MCP tool invocations
- All CLI commands
- Specific subsystem (e.g., tools requiring file paths)

---

## Scenarios

### Scenario: [Behaviour description]

```gherkin
Given the MCP server is running
And [state description]
When [trigger behaviour]
Then [expected outcome]
```

---

## Implementation Details

### Affected Components

- `src/shared/cli/registry.ts`
- `src/mcp-server.ts`

### Logic Implementation

[Brief description of how this behaviour is centralized.]

```typescript
// Example snippet of the global logic
```

### Related Specs & Behaviours

- [FEAT-XXX: Related Feature](../path-to-related.md)
- GB-[CATEGORY]-YYY: [Description]
