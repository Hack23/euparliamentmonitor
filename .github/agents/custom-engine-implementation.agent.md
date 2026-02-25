---
description: Comprehensive guide for implementing custom agentic engines in gh-aw
applyTo: "pkg/workflow/*engine*.go"
disable-model-invocation: true
---

# Custom Agentic Engine Implementation Guide

This document provides a comprehensive guide for implementing custom agentic engines in GitHub Agentic Workflows (gh-aw). It covers architecture patterns, common refactoring opportunities, and step-by-step implementation instructions.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Engine Interface Design](#engine-interface-design)
3. [Common Code Analysis & Refactoring Opportunities](#common-code-analysis--refactoring-opportunities)
4. [Implementation Guide](#implementation-guide)
5. [Testing Strategy](#testing-strategy)
6. [Integration Checklist](#integration-checklist)

---

## Architecture Overview

### Interface Segregation Principle

The agentic engine architecture follows the **Interface Segregation Principle (ISP)** to avoid forcing implementations to depend on methods they don't use. The system uses **interface composition** to provide flexibility while maintaining backward compatibility.

### Interface Hierarchy

```
Engine (core identity - required by all)
├── GetID()
├── GetDisplayName()
├── GetDescription()
└── IsExperimental()

CapabilityProvider (feature detection - optional)
├── SupportsToolsAllowlist()
├── SupportsHTTPTransport()
├── SupportsMaxTurns()
├── SupportsWebFetch()
├── SupportsWebSearch()
├── SupportsFirewall()
├── SupportsPlugins()
└── SupportsLLMGateway()

WorkflowExecutor (compilation - required)
├── GetDeclaredOutputFiles()
├── GetInstallationSteps()
└── GetExecutionSteps()

MCPConfigProvider (MCP servers - optional)
└── RenderMCPConfig()

LogParser (log analysis - optional)
├── ParseLogMetrics()
├── GetLogParserScriptId()
└── GetLogFileForParsing()

SecurityProvider (security features - optional)
├── GetDefaultDetectionModel()
└── GetRequiredSecretNames()

CodingAgentEngine (composite - backward compatibility)
└── Composes all above interfaces
```

### Key Architectural Patterns

1. **BaseEngine Embedding**: All engines embed `BaseEngine` which provides default implementations
2. **Focused Interfaces**: Each interface has a single responsibility
3. **Optional Capabilities**: Engines override only the methods they need
4. **Backward Compatibility**: `CodingAgentEngine` composite interface maintains compatibility

---

## Engine Interface Design

### Core Engine Identity

Every engine must implement the `Engine` interface:

```go
type Engine interface {
    GetID() string            // Unique identifier (e.g., "copilot", "claude", "codex")
    GetDisplayName() string   // Human-readable name (e.g., "GitHub Copilot CLI")
    GetDescription() string   // Capability description
    IsExperimental() bool     // Experimental status flag
}
```

### Capability Detection

Engines can implement `CapabilityProvider` to indicate feature support:

```go
type CapabilityProvider interface {
    SupportsToolsAllowlist() bool    // MCP tool allow-listing
    SupportsHTTPTransport() bool     // HTTP transport for MCP servers
    SupportsMaxTurns() bool          // Max-turns feature
    SupportsWebFetch() bool          // Built-in web-fetch tool
    SupportsWebSearch() bool         // Built-in web-search tool
    SupportsFirewall() bool          // Network firewalling/sandboxing
    SupportsPlugins() bool           // Plugin installation
    SupportsLLMGateway() int         // LLM gateway port (or -1 if not supported)
}
```

### Workflow Compilation

All engines must implement `WorkflowExecutor`:

```go
type WorkflowExecutor interface {
    GetDeclaredOutputFiles() []string                                    // Output files to upload
    GetInstallationSteps(workflowData *WorkflowData) []GitHubActionStep  // Installation steps
    GetExecutionSteps(workflowData *WorkflowData, logFile string) []GitHubActionStep // Execution steps
}
```

### Optional Interfaces

Engines can optionally implement:

- **MCPConfigProvider**: For MCP server configuration
- **LogParser**: For custom log parsing and metrics extraction
- **SecurityProvider**: For security features and secret management

---

## Implementation Guide

### Step 1: Create Engine File

Create `pkg/workflow/my_engine.go`:

```go
package workflow

import "fmt"

// MyEngine implements the custom engine
type MyEngine struct {
    BaseEngine
}

// NewMyEngine creates a new instance of MyEngine
func NewMyEngine() *MyEngine {
    return &MyEngine{
        BaseEngine: BaseEngine{
            ID:           "my-engine",
            DisplayName:  "My Custom Engine",
            Description:  "Custom engine for specific use case",
            Experimental: false,
        },
    }
}
```

### Step 2: Implement WorkflowExecutor

```go
func (e *MyEngine) GetDeclaredOutputFiles() []string {
    return []string{"my-engine-output.log"}
}

func (e *MyEngine) GetInstallationSteps(workflowData *WorkflowData) []GitHubActionStep {
    steps := GetBaseInstallationSteps(workflowData)
    steps = append(steps, BuildStandardNpmEngineInstallSteps(
        "my-engine-cli",
        workflowData.EngineConfig.Version,
        workflowData,
    )...)
    return steps
}

func (e *MyEngine) GetExecutionSteps(workflowData *WorkflowData, logFile string) []GitHubActionStep {
    command := "my-engine"
    if workflowData.EngineConfig != nil && workflowData.EngineConfig.Command != "" {
        command = workflowData.EngineConfig.Command
    }
    
    engineCommand := fmt.Sprintf("%s run --log %s", command, logFile)
    
    if workflowData.IsFirewallEnabled() {
        awfCommand := BuildAWFCommand(workflowData, engineCommand, logFile)
        return []GitHubActionStep{{
            Name: "Run My Engine (sandboxed)",
            Run:  awfCommand,
        }}
    }
    
    return []GitHubActionStep{{
        Name: "Run My Engine",
        Run:  engineCommand,
    }}
}
```

### Step 3: Override Optional Methods

```go
// Override CapabilityProvider methods as needed
func (e *MyEngine) SupportsToolsAllowlist() bool { return true }
func (e *MyEngine) SupportsHTTPTransport() bool  { return true }
func (e *MyEngine) SupportsFirewall() bool        { return true }
```

### Step 4: Register Engine

In `pkg/workflow/agentic_engine.go`:

```go
func NewEngineRegistry() *EngineRegistry {
    registry := &EngineRegistry{engines: make(map[string]CodingAgentEngine)}
    registry.Register(NewCopilotEngine())
    registry.Register(NewClaudeEngine())
    registry.Register(NewCodexEngine())
    registry.Register(NewMyEngine())  // Add your engine
    return registry
}
```

---

## Testing Strategy

### Unit Tests

```go
func TestMyEngine_GetID(t *testing.T) {
    engine := NewMyEngine()
    assert.Equal(t, "my-engine", engine.GetID())
}

func TestMyEngine_GetInstallationSteps(t *testing.T) {
    engine := NewMyEngine()
    data := &WorkflowData{EngineConfig: &EngineConfig{Version: "1.0.0"}}
    steps := engine.GetInstallationSteps(data)
    assert.NotEmpty(t, steps)
}
```

### Integration Tests

```go
func TestMyEngine_CompileWorkflow(t *testing.T) {
    compiler := NewCompiler()
    workflow := &WorkflowData{
        Engine: NewMyEngine(),
        // ... other fields
    }
    result, err := compiler.Compile(workflow)
    assert.NoError(t, err)
    assert.NotEmpty(t, result.ExecutionSteps)
}
```

---

## Integration Checklist

### Code Changes

- [ ] Create `my_engine.go` with engine implementation
- [ ] Create `my_engine_test.go` with unit tests
- [ ] Create `my_engine_integration_test.go` with integration tests
- [ ] Add engine registration in `agentic_engine.go`
- [ ] Add engine constants in `pkg/constants/constants.go`
- [ ] Create `my_engine_logs.go` if custom log parsing is needed
- [ ] Create `my_engine_mcp.go` if custom MCP rendering is needed

### Documentation

- [ ] Add engine documentation in `docs/src/content/docs/reference/engines/`
- [ ] Update engine comparison table
- [ ] Add setup instructions (API keys, configuration)
- [ ] Document required secrets and environment variables
- [ ] Add example workflows using the new engine

### Testing

- [ ] Run `make test-unit` - all unit tests pass
- [ ] Run `make test` - all integration tests pass
- [ ] Run `make lint` - no linting errors
- [ ] Run `make fmt` - code is properly formatted
- [ ] Test workflow compilation with new engine
- [ ] Test workflow execution (manual or CI)

### CI/CD

- [ ] Add engine-specific CI workflow if needed
- [ ] Update CI matrix to include new engine tests
- [ ] Verify Docker image includes engine dependencies
- [ ] Test in clean environment (no cached dependencies)

### Final Validation

- [ ] Run `make agent-finish` - complete validation passes
- [ ] Create PR with comprehensive description
- [ ] Request review from maintainers
- [ ] Address review feedback
- [ ] Merge when approved

---

## Best Practices

### 1. Use Shared Helpers

Always prefer existing helpers over duplicating code:
- `GetBaseInstallationSteps()` for standard installation
- `BuildAWFCommand()` for firewall integration
- `FormatStepWithCommandAndEnv()` for step formatting
- `FilterEnvForSecrets()` for security

### 2. Follow Naming Conventions

- Engine ID: lowercase with hyphens (e.g., `my-engine`)
- Logger: `workflow:engine_name` (e.g., `workflow:my_engine`)
- Files: `engine_name_*.go` (e.g., `my_engine.go`, `my_engine_logs.go`)
- Constants: `DefaultMyEngineVersion`, `MyEngineLLMGatewayPort`

### 3. Security First

- Always filter environment variables with `FilterEnvForSecrets()`
- Validate secrets before execution
- Use AWF firewall when `isFirewallEnabled()` returns true
- Never log sensitive information

### 4. Maintain Backward Compatibility

- Use interface composition, not breaking changes
- Override BaseEngine methods, don't replace them
- Support legacy configuration formats
- Document migration paths

### 5. Test Thoroughly

- Unit tests for core functionality
- Integration tests for workflow compilation
- Test with MCP servers enabled/disabled
- Test with firewall enabled/disabled
- Test custom configuration scenarios

---

## Common Pitfalls

### 1. Forgetting to Register Engine

Always add your engine to `NewEngineRegistry()` in `agentic_engine.go`.

### 2. Not Handling Custom Commands

Support custom commands via `workflowData.EngineConfig.Command`:

```go
commandName := "my-engine"
if workflowData.EngineConfig != nil && workflowData.EngineConfig.Command != "" {
    commandName = workflowData.EngineConfig.Command
}
```

### 3. Incorrect PATH Setup

Use `GetNpmBinPathSetup()` for npm-installed CLIs inside AWF:

```go
npmPathSetup := GetNpmBinPathSetup()
engineCommandWithPath := fmt.Sprintf("%s && %s", npmPathSetup, engineCommand)
```

### 4. Missing Secret Filtering

Always filter environment variables:

```go
allowedSecrets := e.GetRequiredSecretNames(workflowData)
filteredEnv := FilterEnvForSecrets(env, allowedSecrets)
```

### 5. Hardcoding Paths

Use constants and configuration:

```go
// ❌ BAD
logFile := "/tmp/my-log.txt"

// ✅ GOOD
logFile := workflowData.LogFile // or passed as parameter
```

---

## Summary

Implementing a custom agentic engine involves:

1. **Understanding the architecture**: Interface segregation with focused responsibilities
2. **Leveraging existing helpers**: Don't reinvent the wheel
3. **Following patterns**: Learn from existing engines (Copilot, Claude, Codex)
4. **Testing thoroughly**: Unit tests, integration tests, manual validation
5. **Documenting completely**: Help users understand and use your engine

The gh-aw codebase provides excellent infrastructure for engine development. Use the shared helpers, follow the patterns, and focus on your engine's unique capabilities.

For questions or clarifications, refer to existing engine implementations:
- **Copilot** (`copilot_engine*.go`): Well-modularized, clean separation
- **Claude** (`claude_engine.go`): Comprehensive, feature-rich
- **Codex** (`codex_engine.go`): Regex-based log parsing
- **Custom** (`custom_engine.go`): Minimal, flexible implementation

Happy coding! 🚀
