---
description: Adding a New Safe Output Type to GitHub Agentic Workflows
disable-model-invocation: true
---

# Add New Safe Output Type

This guide covers adding a new safe output type to process AI agent outputs in JSONL format through a validation pipeline (TypeScript types → JSON schema → JavaScript collection).

## Implementation Steps

### 1. Update JSON Schema (`schemas/agent-output.json`)

Add object definition in `$defs` section:
   ```json
   "YourNewTypeOutput": {
     "title": "Your New Type Output",
     "description": "Output for your new functionality",
     "type": "object",
     "properties": {
       "type": {
         "const": "your-new-type"
       },
       "required_field": {
         "type": "string",
         "description": "Description of required field",
         "minLength": 1
       },
       "optional_field": {
         "type": "string", 
         "description": "Description of optional field"
       }
     },
     "required": ["type", "required_field"],
     "additionalProperties": false
   }
   ```

Add to `SafeOutput` oneOf array: `{"$ref": "#/$defs/YourNewTypeOutput"}`

**Validation Notes**: Use `const` for type field, `minLength: 1` for required strings, `additionalProperties: false`, `oneOf` for union types.

### 2. Update TypeScript Types

**File**: `pkg/workflow/js/types/safe-outputs.d.ts`
   ```typescript
   /**
    * JSONL item for [description]
    */
   interface YourNewTypeItem extends BaseSafeOutputItem {
     type: "your-new-type";
     /** Required field description */
     required_field: string;
     /** Optional field description */
     optional_field?: string;
   }
   ```

Add to `SafeOutputItem` union type and export list.

**File**: `pkg/workflow/js/types/safe-outputs-config.d.ts` - Add config interface, add to `SpecificSafeOutputConfig` union, export.

### 3. Update Safe Outputs Tools JSON (`pkg/workflow/js/safe_outputs_tools.json`)

Add tool signature to expose to AI agents:

```json
{
  "name": "your_new_type",
  "description": "Brief description of what this tool does (use underscores in name, not hyphens)",
  "inputSchema": {
    "type": "object",
    "required": ["required_field"],
    "properties": {
      "required_field": {
        "type": "string",
        "description": "Description of the required field"
      },
      "optional_field": {
        "type": "string",
        "description": "Description of the optional field"
      },
      "numeric_field": {
        "type": ["number", "string"],
        "description": "Numeric field that accepts both number and string types"
      }
    },
    "additionalProperties": false
  }
}
```

**Guidelines**: Use underscores in tool `name`, match with type field, set `additionalProperties: false`, use `"type": ["number", "string"]` for numeric fields.

**Important**: File is embedded via `//go:embed` - **must rebuild** with `make build` after changes.

### 4. Update MCP Server JavaScript (If Custom Handler Needed) (`pkg/workflow/js/safe_outputs_mcp_server.cjs`)

Most types use the default JSONL handler. Add custom handler only if needed for file operations, git commands, or complex validation:

```javascript
/**
 * Handler for your_new_type safe output
 * @param {Object} args - Arguments passed to the tool
 * @returns {Object} MCP tool response
 */
const yourNewTypeHandler = args => {
  // Perform any custom validation
  if (!args.required_field || typeof args.required_field !== "string") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: "required_field is required and must be a string",
          }),
        },
      ],
      isError: true,
    };
  }

  // Perform custom operations (e.g., file system operations, git commands)
  try {
    // Your custom logic here
    const result = performCustomOperation(args);
    
    // Write the JSONL entry
    const entry = {
      type: "your_new_type",
      required_field: args.required_field,
      optional_field: args.optional_field,
      // Add any additional fields from custom processing
      result_data: result,
    };
    
    appendSafeOutput(entry);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            message: "Your new type processed successfully",
            result: result,
          }),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
          }),
        },
      ],
      isError: true,
    };
  }
};
```

### 5. Update Go Filter (`pkg/workflow/mcp_server.go`)

Add type to `generateFilteredToolsJSON` so the MCP server exposes it:

```go
case "your-new-type":
    include = true
```

### 6. Update Collection Script (`pkg/workflow/js/safe_outputs_collect.cjs`)

Add field validation to `collectOutputs()`:

```javascript
case "your-new-type":
    if (!item.required_field) {
        core.warning(`Skipping your-new-type: missing required_field`);
        continue;
    }
    collected.push({
        type: item.type,
        required_field: item.required_field,
        optional_field: item.optional_field || "",
    });
    break;
```

### 7. Tests

Add tests in `pkg/workflow/js/__tests__/`:

```javascript
describe("your-new-type", () => {
    test("MCP server accepts valid input", async () => {
        const result = await callTool("your_new_type", {
            required_field: "test value",
        });
        expect(result.isError).toBeFalsy();
    });

    test("MCP server rejects missing required field", async () => {
        const result = await callTool("your_new_type", {});
        expect(result.isError).toBeTruthy();
    });

    test("collection validates fields", () => {
        const items = [
            { type: "your-new-type", required_field: "value" },
            { type: "your-new-type" }, // missing required_field
        ];
        const collected = collectOutputs(items);
        expect(collected).toHaveLength(1);
    });
});
```

### 8. Go Tests

```go
func TestYourNewType(t *testing.T) {
    t.Run("includes type in filtered tools", func(t *testing.T) {
        data := &WorkflowData{
            SafeOutputs: SafeOutputsConfig{
                YourNewType: &YourNewTypeConfig{},
            },
        }
        tools := generateFilteredToolsJSON(data)
        assert.Contains(t, tools, "your_new_type")
    })
}
```

### 9. Go Configuration

Add config struct:

```go
// YourNewTypeConfig holds configuration for your-new-type safe output
type YourNewTypeConfig struct {
    BaseSafeOutputConfig
    RequiredField string `yaml:"required-field"`
}
```

### 10. Handler Implementation (for handler-manager pattern)

**Step 1: Create Handler Factory** in `actions/setup/js/your_new_type.cjs`:

```javascript
const core = require("@actions/core");
const { Octokit } = require("@octokit/rest");

/**
 * Factory function for your_new_type handler
 * @param {Object} config - Handler configuration
 * @returns {Function} Async message handler function
 */
module.exports = function createYourNewTypeHandler(config) {
  const octokit = new Octokit({ auth: config.token });

  /**
   * Process a single your_new_type message
   * @param {Object} message - The safe output message
   */
  return async function handleYourNewType(message) {
    core.info(`Processing your_new_type: ${message.required_field}`);
    // Implementation here
  };
};
```

**Step 2: Register in Handler Manager** (`actions/setup/js/safe_output_handler_manager.cjs`):

```javascript
const HANDLER_MAP = {
  // ... existing handlers
  "your_new_type": () => require("./your_new_type.cjs"),
};
```

**Step 3: Add Config** in `pkg/workflow/compiler_safe_outputs_job.go`:

```go
func (c *Compiler) addHandlerManagerConfigEnvVar(...) {
    // ... existing configs
    if data.SafeOutputs.YourNewType != nil {
        handlerConfig := map[string]interface{}{
            "max": data.SafeOutputs.YourNewType.Max,
        }
        config["your_new_type"] = handlerConfig
    }
}
```

**Step 4: Add to Consolidated Job Check** in `pkg/workflow/compiler_safe_outputs_job.go`:

```go
hasHandlerManagerTypes := data.SafeOutputs.CreateIssues != nil ||
    data.SafeOutputs.AddComments != nil ||
    // ... existing checks ...
    data.SafeOutputs.YourNewType != nil
```

### 11. Build and Test

```bash
make js fmt-cjs lint-cjs test-unit recompile agent-finish
```

### 12. Manual Validation

Test workflow with staged/non-staged modes, error handling, JSON schema validation, all engines.

## Success Criteria

- [ ] JSON schema validates correctly
- [ ] TypeScript types compile
- [ ] Tools JSON includes tool signature  
- [ ] MCP server handles type (custom handler if needed)
- [ ] Go filter includes type in `generateFilteredToolsJSON`
- [ ] Collection validates fields
- [ ] Handler factory function implemented (returns message handler)
- [ ] Handler registered in HANDLER_MAP or STANDALONE_STEP_TYPES
- [ ] Handler config added to `addHandlerManagerConfigEnvVar()`
- [ ] Permissions added to consolidated job
- [ ] Tests pass with good coverage
- [ ] Workflows compile
- [ ] Manual testing confirms functionality

## Common Pitfalls

1. Inconsistent naming across files (kebab-case/camelCase/underscores)
2. Missing tools.json update (agents can't call without it)
3. Missing Go filter update (MCP won't expose tool)
4. Missing field validation/sanitization
5. Not adding to union types
6. Not exporting interfaces
7. Test coverage gaps
8. Schema syntax violations
9. GitHub API error handling
10. Missing staged mode implementation
11. Forgetting `make build` after modifying embedded files
12. Handler factory not returning a function (must return async message handler)
13. Forgetting to add handler to HANDLER_MAP in safe_output_handler_manager.cjs
14. Not adding handler config to addHandlerManagerConfigEnvVar() in compiler
15. Missing hasHandlerManagerTypes check for consolidated job integration

## References

- JSON Schema: https://json-schema.org/draft-07/schema
- GitHub Actions Core: https://github.com/actions/toolkit/tree/main/packages/core  
- GitHub REST API: https://docs.github.com/en/rest
- Vitest: https://vitest.dev/
- Handler Manager: `actions/setup/js/safe_output_handler_manager.cjs`
- Existing Handler Implementations: `actions/setup/js/create_issue.cjs`, `actions/setup/js/add_comment.cjs`, etc.
- Compiler Integration: `pkg/workflow/compiler_safe_outputs_*.go`
