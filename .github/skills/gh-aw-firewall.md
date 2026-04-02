---
name: gh-aw-firewall
description: Agent Workflow Firewall (AWF) — Squid proxy-based network firewall for sandboxed AI agent execution with domain allowlists
tools: []
---

# Skill: Agent Workflow Firewall (AWF)

## Overview

The **Agent Workflow Firewall (AWF)** is the network security layer in GitHub Agentic Workflows. It routes all agent-initiated outbound traffic through a **Squid proxy** enforcing an explicit domain allowlist. Traffic to any destination not on the allowlist is **dropped at the kernel level**.

## How AWF Works

1. Agent container runs with all outbound traffic routed through the Squid proxy
2. The proxy enforces a **domain allowlist** — only explicitly permitted domains are reachable
3. Unlisted traffic is dropped at the kernel level (iptables/nftables rules)
4. All requests are logged for auditing and threat detection

```
Agent Container
  └── All HTTP(S) traffic → Squid Proxy
        ├── ✓ Allowed domain → Forward request
        └── ✗ Unlisted domain → DROP (kernel-level block)
```

## Domain Allowlist Configuration

In this repo's workflow frontmatter, network access is configured through the `network.allowed` section:

```markdown
---
network:
  allowed:
    - node
    - github.com
    - api.github.com
    - data.europarl.europa.eu
    - "*.europa.eu"
    - default
---
```

Additionally, `safe-outputs.allowed-domains` restricts which domains the agent can reference in output:

```markdown
---
safe-outputs:
  allowed-domains:
    - data.europarl.europa.eu
    - www.europarl.europa.eu
    - github.com
  create-pull-request: {}
---
```

## Security Properties

### What AWF Prevents
- **Data exfiltration** — Agent cannot send data to unauthorized servers
- **C2 communication** — No callback to attacker-controlled infrastructure
- **Supply chain attacks** — Only pre-approved package registries accessible
- **DNS tunneling** — DNS resolution restricted to allowed domains

### Defense-in-Depth Integration
AWF is Layer 3 of the 5-layer security model:

| Layer | Control | Purpose |
|-------|---------|---------|
| 1 | Read-only token | Agent can't modify repository |
| 2 | Zero secrets | Agent has no credentials to steal |
| **3** | **AWF Firewall** | **Agent can't reach unauthorized networks** |
| 4 | Safe outputs | Agent can't write directly to GitHub |
| 5 | Threat detection | AI scan blocks suspicious output |

## EU Parliament Monitor Relevance

For this project's gh-aw workflows, the AWF ensures:
- Agents can only access `data.europarl.europa.eu` and `www.europarl.europa.eu` for EP data
- Wildcard `*.europa.eu` is allowed for additional EU institutional domains
- GitHub API access is limited to read operations
- No unauthorized external API calls during news generation
- All MCP server communication stays within the sandbox

## Integrity Filtering

AWF also supports **integrity filtering** for public repositories to control which external contributors can trigger agent workflows:

```markdown
---
tools:
  github:
    min-integrity: approved    # Default: only owners/members/collaborators
    # Options: approved, none (allows all contributors)
---
```

## Monitoring and Debugging

### Viewing Firewall Logs
```bash
# Check workflow run logs for AWF blocks
gh aw logs <workflow-name>

# Audit a specific run
gh aw audit <run-id>
```

### Common Issues

**Agent can't reach required API**: Add domain to the tools allowlist in frontmatter

**Unexpected blocks**: Check AWF logs in the workflow run — blocked domains are logged with the request details

**Slow responses**: AWF adds minimal latency; slow responses usually indicate upstream API issues

## Best Practices

1. **Minimal allowlist** — Only allow domains the workflow actually needs
2. **Use built-in tools** — `github`, `web-fetch`, `web-search` handle their own domain needs
3. **Avoid wildcards** — Prefer explicit domain names over `*.example.com`
4. **Audit regularly** — Review AWF logs for unexpected access patterns
5. **Test in monitor mode** — Validate allowlists before enforcing

## Resources

- **AWF Architecture**: https://github.github.com/gh-aw/introduction/architecture/
- **Security Guide**: https://github.github.com/gh-aw/reference/security/
- **Integrity Filtering**: https://github.github.com/gh-aw/reference/integrity/
