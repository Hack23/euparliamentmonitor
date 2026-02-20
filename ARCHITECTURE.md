<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🏛️ EU Parliament Monitor — Architecture</h1>

<p align="center">
  <strong>C4 Model Architecture for European Parliament Intelligence Platform</strong><br>
  <em>📐 System Context • 📦 Container View • 🔧 Component Design</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--02--20-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Review-Quarterly-orange?style=for-the-badge" alt="Review Cycle"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:**
2026-02-20 (UTC)  
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-05-20

---

This document serves as the primary entry point for the EU Parliament Monitor's
architectural documentation. It provides a comprehensive view of the system's
design using the C4 model approach, starting from a high-level system context
and drilling down to component interactions.

## 📚 Architecture Documentation Map

<div class="documentation-map">

| Document                                                            | Focus           | Description                                    | Documentation Link                                                                                     |
| ------------------------------------------------------------------- | --------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **[Architecture](ARCHITECTURE.md)**                                 | 🏛️ Architecture | C4 model showing current system structure      | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/ARCHITECTURE.md)                 |
| **[Future Architecture](FUTURE_ARCHITECTURE.md)**                   | 🏛️ Architecture | C4 model showing future system structure       | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FUTURE_ARCHITECTURE.md)          |
| **[Mindmaps](MINDMAP.md)**                                          | 🧠 Concept      | Current system component relationships         | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/MINDMAP.md)                      |
| **[Future Mindmaps](FUTURE_MINDMAP.md)**                            | 🧠 Concept      | Future capability evolution                    | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FUTURE_MINDMAP.md)               |
| **[SWOT Analysis](SWOT.md)**                                        | 💼 Business     | Current strategic assessment                   | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/SWOT.md)                         |
| **[Future SWOT Analysis](FUTURE_SWOT.md)**                          | 💼 Business     | Future strategic opportunities                 | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FUTURE_SWOT.md)                  |
| **[Data Model](DATA_MODEL.md)**                                     | 📊 Data         | Current data structures and relationships      | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/DATA_MODEL.md)                   |
| **[Future Data Model](FUTURE_DATA_MODEL.md)**                       | 📊 Data         | Enhanced European Parliament data architecture | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FUTURE_DATA_MODEL.md)            |
| **[Flowcharts](FLOWCHART.md)**                                      | 🔄 Process      | Current data processing workflows              | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FLOWCHART.md)                    |
| **[Future Flowcharts](FUTURE_FLOWCHART.md)**                        | 🔄 Process      | Enhanced AI-driven workflows                   | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FUTURE_FLOWCHART.md)             |
| **[State Diagrams](STATEDIAGRAM.md)**                               | 🔄 Behavior     | Current system state transitions               | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/STATEDIAGRAM.md)                 |
| **[Future State Diagrams](FUTURE_STATEDIAGRAM.md)**                 | 🔄 Behavior     | Enhanced adaptive state transitions            | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FUTURE_STATEDIAGRAM.md)          |
| **[Security Architecture](SECURITY_ARCHITECTURE.md)**               | 🛡️ Security     | Current security implementation                | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/SECURITY_ARCHITECTURE.md)        |
| **[Future Security Architecture](FUTURE_SECURITY_ARCHITECTURE.md)** | 🛡️ Security     | Security enhancement roadmap                   | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FUTURE_SECURITY_ARCHITECTURE.md) |
| **[Threat Model](THREAT_MODEL.md)**                                 | 🎯 Security     | STRIDE threat analysis                         | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/THREAT_MODEL.md)                 |
| **[Classification](CLASSIFICATION.md)**                             | 🏷️ Governance   | CIA classification & BCP                       | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/CLASSIFICATION.md)               |
| **[CRA Assessment](CRA-ASSESSMENT.md)**                             | 🛡️ Compliance   | Cyber Resilience Act                           | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/CRA-ASSESSMENT.md)               |
| **[Workflows](WORKFLOWS.md)**                                       | ⚙️ DevOps       | CI/CD documentation                            | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/WORKFLOWS.md)                    |
| **[Future Workflows](FUTURE_WORKFLOWS.md)**                         | 🚀 DevOps       | Planned CI/CD enhancements                     | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FUTURE_WORKFLOWS.md)             |
| **[Business Continuity Plan](BCPPlan.md)**                          | 🔄 Resilience   | Recovery planning                              | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/BCPPlan.md)                      |
| **[Financial Security Plan](FinancialSecurityPlan.md)**             | 💰 Financial    | Cost & security analysis                       | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FinancialSecurityPlan.md)        |
| **[End-of-Life Strategy](End-of-Life-Strategy.md)**                 | 📦 Lifecycle    | Technology EOL planning                        | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/End-of-Life-Strategy.md)         |
| **[Unit Test Plan](UnitTestPlan.md)**                               | 🧪 Testing      | Unit testing strategy                          | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/UnitTestPlan.md)                 |
| **[E2E Test Plan](E2ETestPlan.md)**                                 | 🔍 Testing      | End-to-end testing                             | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/E2ETestPlan.md)                  |
| **[Performance Testing](performance-testing.md)**                   | ⚡ Performance  | Performance benchmarks                         | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/performance-testing.md)          |

</div>

## 🎯 System Overview

EU Parliament Monitor is a static site generator that creates multi-language
news articles about European Parliament activities, leveraging the European
Parliament MCP Server for data access and LLM-based content generation.

### Mission Statement

**Enable democratic transparency** by providing automated, multilingual coverage
of European Parliament activities through a secure, maintainable static site
architecture.

### Key Characteristics

- **Zero Runtime Dependencies**: Pure static HTML/CSS/JS with no server-side
  execution
- **Multi-Language Support**: Generates content in 14 European languages
- **MCP Integration**: Uses European Parliament MCP Server for data access
- **Security by Design**: Minimal attack surface through static architecture
- **GitHub Hosted**: Leverages GitHub Pages for zero-infrastructure hosting

---

## 📊 C4 Model Level 1: System Context Diagram

**👤 User Focus:** Shows how different user types interact with the EU
Parliament Monitor system and what external systems it depends on.

**🌐 Integration Focus:** Illustrates the relationships with GitHub
infrastructure, European Parliament APIs, and LLM services.

```mermaid
C4Context
    title EU Parliament Monitor - System Context Diagram

    Person(citizen, "European Citizen", "Reads news about European Parliament activities in their native language")
    Person(journalist, "Journalist", "Uses site as research source for European political coverage")
    Person(researcher, "Political Researcher", "Analyzes EP activities and trends")
    Person(contributor, "Developer/Contributor", "Maintains and improves the news generation system")

    System(epmonitor, "EU Parliament Monitor", "Static site with multilingual news about European Parliament activities")

    System_Ext(github, "GitHub", "Hosts repository, runs CI/CD, serves GitHub Pages")
    System_Ext(ep_mcp, "European Parliament MCP Server", "Provides structured access to EP data")
    System_Ext(ep_api, "European Parliament APIs", "Official EP data sources (plenary, committees, documents)")
    System_Ext(llm, "LLM Service", "Generates article content from structured EP data")

    Rel(citizen, epmonitor, "Reads news", "HTTPS")
    Rel(journalist, epmonitor, "Researches stories", "HTTPS")
    Rel(researcher, epmonitor, "Analyzes data", "HTTPS")
    Rel(contributor, github, "Contributes code", "Git/HTTPS")

    Rel(epmonitor, github, "Hosted on", "GitHub Pages")
    Rel(github, epmonitor, "Generates site via", "GitHub Actions")
    Rel(epmonitor, ep_mcp, "Fetches EP data via", "MCP Protocol")
    Rel(ep_mcp, ep_api, "Queries EP data", "HTTPS/JSON")
    Rel(epmonitor, llm, "Generates content via", "API/SDK")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="2")
```

### Context Diagram - Key Elements

| Element                   | Type            | Description                                                | Technology                  |
| ------------------------- | --------------- | ---------------------------------------------------------- | --------------------------- |
| **European Citizen**      | User            | Primary audience seeking EP news in native language        | Web Browser                 |
| **Journalist**            | User            | Professional using site for research and story development | Web Browser                 |
| **Political Researcher**  | User            | Academic or analyst studying EP activities                 | Web Browser                 |
| **Developer/Contributor** | User            | Maintainer improving system                                | Git, Node.js, VS Code       |
| **EU Parliament Monitor** | System          | Core static site generator                                 | Node.js, JavaScript         |
| **GitHub**                | External System | Source control, CI/CD, hosting                             | GitHub Actions, Pages       |
| **EP MCP Server**         | External System | Structured EP data access                                  | MCP Protocol, TypeScript    |
| **EP APIs**               | External System | Official data sources                                      | REST APIs, JSON             |
| **LLM Service**           | External System | Content generation                                         | API (OpenAI/Anthropic/etc.) |

---

## 📦 C4 Model Level 2: Container Diagram

**📦 Container Focus:** Shows the major containers (applications, data stores,
microservices) that make up the system.

**🔄 Data Flow Focus:** Illustrates how data flows between containers during
news generation.

```mermaid
C4Container
    title EU Parliament Monitor - Container Diagram

    Person(user, "User", "Reads multilingual EP news")
    Person(contributor, "Contributor", "Maintains system")

    Container_Boundary(epmonitor, "EU Parliament Monitor") {
        Container(news_generator, "News Generation Scripts", "Node.js/JavaScript", "Generates multilingual news articles from EP data")
        Container(index_generator, "Index Page Generator", "Node.js/JavaScript", "Creates language-specific index pages")
        Container(sitemap_generator, "Sitemap Generator", "Node.js/JavaScript", "Generates sitemap.xml for SEO")
        Container(mcp_client, "MCP Client", "JavaScript", "Communicates with EP MCP Server for data access")
        Container(template_engine, "Article Template Engine", "JavaScript", "Generates HTML from article data")
        ContainerDb(static_files, "Static Files", "HTML/CSS/JS", "Generated news articles and indexes")
    }

    Container_Boundary(github_infra, "GitHub Infrastructure") {
        Container(actions, "GitHub Actions", "CI/CD", "Automated news generation workflow")
        Container(pages, "GitHub Pages", "Web Server", "Serves static site via CDN")
        ContainerDb(repo, "Git Repository", "Version Control", "Source code and generated content")
    }

    System_Ext(ep_mcp, "European Parliament MCP Server", "Structured EP data access")
    System_Ext(llm, "LLM Service", "Article content generation")

    Rel(user, pages, "Reads news", "HTTPS")
    Rel(contributor, repo, "Commits code", "Git/HTTPS")
    Rel(actions, news_generator, "Triggers daily", "Node.js exec")
    Rel(news_generator, mcp_client, "Requests EP data", "MCP calls")
    Rel(news_generator, llm, "Generates content", "API calls")
    Rel(news_generator, template_engine, "Creates HTML", "Function calls")
    Rel(template_engine, static_files, "Writes files", "fs.writeFileSync")
    Rel(index_generator, static_files, "Generates indexes", "fs.writeFileSync")
    Rel(sitemap_generator, static_files, "Creates sitemap", "fs.writeFileSync")
    Rel(mcp_client, ep_mcp, "Queries data", "MCP Protocol")
    Rel(static_files, repo, "Committed by Actions", "Git commit/push")
    Rel(pages, static_files, "Serves from repo", "GitHub Pages")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="2")
```

### Container Diagram - Key Elements

| Container                   | Technology         | Purpose                               | Data Flow                                        |
| --------------------------- | ------------------ | ------------------------------------- | ------------------------------------------------ |
| **News Generation Scripts** | Node.js/JavaScript | Core article generation logic         | Orchestrates MCP data fetch and LLM generation   |
| **Index Page Generator**    | Node.js/JavaScript | Creates language-specific index pages | Aggregates article metadata into navigation      |
| **Sitemap Generator**       | Node.js/JavaScript | SEO sitemap creation                  | Lists all pages for search engine crawling       |
| **MCP Client**              | JavaScript         | EP data access                        | Communicates with MCP Server for structured data |
| **Article Template Engine** | JavaScript         | HTML generation                       | Converts article data to semantic HTML5          |
| **Static Files**            | HTML/CSS/JS        | Generated output                      | Committed to repository, served by GitHub Pages  |
| **GitHub Actions**          | CI/CD              | Automation                            | Daily workflow execution, build and deploy       |
| **GitHub Pages**            | CDN/Web Server     | Hosting                               | HTTPS delivery of static content                 |
| **Git Repository**          | Version Control    | Source & Content                      | Stores code, generated articles, configuration   |

---

## 🧩 C4 Model Level 3: Component Diagram - News Generation

**🔧 Component Focus:** Detailed view of the news generation container's
internal components.

**🎯 Responsibility Focus:** Shows how different components collaborate to
generate multilingual news articles.

```mermaid
C4Component
    title EU Parliament Monitor - News Generation Components

    Container_Boundary(news_gen, "News Generation Container") {
        Component(cli, "CLI Interface", "JavaScript", "Parses command-line arguments for generation parameters")
        Component(article_gen, "Article Generator", "JavaScript", "Coordinates article creation for specified types/languages")
        Component(mcp_client, "MCP Client", "JavaScript", "Fetches EP data via MCP protocol")
        Component(llm_client, "LLM Client", "JavaScript", "Generates article content from EP data")
        Component(translator, "Translation Handler", "JavaScript", "Manages multi-language content generation")
        Component(template, "HTML Template Engine", "JavaScript", "Renders articles as semantic HTML5")
        Component(file_writer, "File System Writer", "JavaScript", "Writes generated articles to disk")
        Component(metadata, "Metadata Manager", "JavaScript", "Tracks generation metadata and timestamps")
        Component(validator, "Content Validator", "JavaScript", "Validates generated HTML and content")
    }

    System_Ext(ep_mcp, "EP MCP Server", "EP data access")
    System_Ext(llm, "LLM Service", "Content generation")
    ContainerDb(output, "Static Files", "HTML files")

    Rel(cli, article_gen, "Invokes with params", "Function call")
    Rel(article_gen, mcp_client, "Requests EP data", "Async calls")
    Rel(article_gen, llm_client, "Generates content", "Async calls")
    Rel(article_gen, translator, "Processes languages", "Function call")
    Rel(translator, llm_client, "Language-specific generation", "Async calls")
    Rel(article_gen, template, "Renders HTML", "Function call")
    Rel(template, validator, "Validates output", "Function call")
    Rel(article_gen, file_writer, "Writes articles", "Function call")
    Rel(article_gen, metadata, "Tracks generation", "Function call")
    Rel(mcp_client, ep_mcp, "Queries data", "MCP Protocol")
    Rel(llm_client, llm, "API calls", "HTTPS/JSON")
    Rel(file_writer, output, "Writes files", "fs.writeFileSync")
    Rel(metadata, output, "Writes JSON", "fs.writeFileSync")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

### Component Diagram - Key Elements

| Component                | Responsibility                   | Dependencies                     | File Location                     |
| ------------------------ | -------------------------------- | -------------------------------- | --------------------------------- |
| **CLI Interface**        | Parse command-line arguments     | Node.js process.argv             | scripts/generate-news-enhanced.js |
| **Article Generator**    | Orchestrate article creation     | MCP Client, LLM Client, Template | scripts/generate-news-enhanced.js |
| **MCP Client**           | Fetch EP data via MCP            | EP MCP Server                    | scripts/ep-mcp-client.js          |
| **LLM Client**           | Generate article text            | LLM Service API                  | Integrated in article generator   |
| **Translation Handler**  | Manage multi-language generation | LLM Client                       | scripts/generate-news-enhanced.js |
| **HTML Template Engine** | Render semantic HTML5            | Article data                     | scripts/article-template.js       |
| **File System Writer**   | Write files to disk              | Node.js fs module                | scripts/generate-news-enhanced.js |
| **Metadata Manager**     | Track generation metadata        | Article data                     | scripts/generate-news-enhanced.js |
| **Content Validator**    | Validate HTML output             | HTML validator                   | Integrated in template            |

---

## 🔄 Deployment Diagram

**☁️ Infrastructure Focus:** Shows how the system is deployed on GitHub
infrastructure.

**🚀 CI/CD Focus:** Illustrates the automated deployment pipeline.

```mermaid
C4Deployment
    title EU Parliament Monitor - Deployment Diagram

    Deployment_Node(github_cloud, "GitHub Cloud", "GitHub Infrastructure") {
        Deployment_Node(actions_runner, "GitHub Actions Runner", "Ubuntu 24.04") {
            Container(workflow, "News Generation Workflow", "GitHub Actions YAML", "Daily scheduled workflow")
            Container(node_runtime, "Node.js Runtime", "Node.js 24", "Executes generation scripts")
        }

        Deployment_Node(pages_cdn, "GitHub Pages CDN", "Fastly CDN") {
            Container(web_server, "Static Web Server", "Nginx/Fastly", "Serves HTTPS content")
            ContainerDb(static_content, "Static Files", "HTML/CSS/JS/JSON", "Generated articles and pages")
        }

        Deployment_Node(repo_storage, "GitHub Repository", "Git Storage") {
            ContainerDb(git_repo, "Git Repository", "Version Control", "Source code and generated content")
        }
    }

    Deployment_Node(user_device, "User Device", "Desktop/Mobile") {
        Container(browser, "Web Browser", "Chrome/Firefox/Safari", "Renders news articles")
    }

    Deployment_Node(external_services, "External Services", "Cloud") {
        System_Ext(ep_mcp, "EP MCP Server", "EP data access")
        System_Ext(llm, "LLM Service", "Content generation")
    }

    Rel(workflow, node_runtime, "Executes", "Process")
    Rel(node_runtime, ep_mcp, "Fetches data", "HTTPS/MCP")
    Rel(node_runtime, llm, "Generates content", "HTTPS/API")
    Rel(node_runtime, git_repo, "Commits files", "Git")
    Rel(git_repo, static_content, "Deploys", "GitHub Pages")
    Rel(browser, web_server, "Requests pages", "HTTPS")
    Rel(web_server, static_content, "Serves", "HTTP/2")

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

### Deployment - Key Infrastructure

| Infrastructure Component  | Technology               | Purpose                           | Configuration                         |
| ------------------------- | ------------------------ | --------------------------------- | ------------------------------------- |
| **GitHub Actions Runner** | Ubuntu 24.04, Node.js 24 | Execute generation workflow       | .github/workflows/news-generation.yml |
| **GitHub Pages CDN**      | Fastly CDN, Nginx        | Serve static content globally     | Enabled in repository settings        |
| **Git Repository**        | GitHub Storage           | Version control + content storage | public repository                     |
| **Web Browser**           | Modern browsers          | Render news articles              | HTML5, CSS3, ES6+                     |
| **EP MCP Server**         | External service         | EP data access                    | MCP protocol endpoint                 |
| **LLM Service**           | External API             | Content generation                | API key authentication                |

---

## 📊 Technology Stack

### Core Technologies

| Layer               | Technology | Version | Purpose                          |
| ------------------- | ---------- | ------- | -------------------------------- |
| **Runtime**         | Node.js    | 24.x    | JavaScript execution environment |
| **Language**        | JavaScript | ES2022  | Primary development language     |
| **Package Manager** | npm        | 10.x    | Dependency management            |
| **Testing**         | Vitest     | 3.x     | Unit and integration testing     |
| **E2E Testing**     | Playwright | 1.58.x  | End-to-end browser testing       |
| **Linting**         | ESLint     | 9.x     | Code quality and security        |
| **Formatting**      | Prettier   | 3.x     | Code formatting                  |

### Security & Quality

| Tool                | Purpose                           | Integration                  |
| ------------------- | --------------------------------- | ---------------------------- |
| **CodeQL**          | SAST scanning                     | GitHub Actions (weekly + PR) |
| **Dependabot**      | Dependency vulnerability scanning | GitHub native (daily)        |
| **npm audit**       | Dependency security check         | Pre-commit + CI              |
| **ESLint Security** | Security-focused linting          | Pre-commit + CI              |
| **HTMLHint**        | HTML validation                   | CI pipeline                  |
| **Husky**           | Git hooks                         | Pre-commit, pre-push         |

### Infrastructure

| Service            | Purpose             | Configuration            |
| ------------------ | ------------------- | ------------------------ |
| **GitHub Actions** | CI/CD automation    | .github/workflows/       |
| **GitHub Pages**   | Static site hosting | Repository settings      |
| **Fastly CDN**     | Content delivery    | GitHub Pages integration |
| **Git**            | Version control     | Repository               |

---

## 🔄 Data Flow

### News Generation Flow

```mermaid
sequenceDiagram
    participant GHA as GitHub Actions
    participant CLI as CLI Interface
    participant Gen as Article Generator
    participant MCP as MCP Client
    participant EP as EP MCP Server
    participant LLM as LLM Service
    participant TPL as Template Engine
    participant FS as File System

    GHA->>CLI: Trigger daily workflow
    CLI->>Gen: generate-news --types=week-ahead --languages=all
    Gen->>MCP: getPlenary Sessions()
    MCP->>EP: Query upcoming sessions
    EP-->>MCP: Session data
    MCP-->>Gen: Structured EP data

    loop For each language
        Gen->>LLM: Generate article(EP data, language)
        LLM-->>Gen: Article content
        Gen->>TPL: Render HTML(article, language)
        TPL-->>Gen: HTML output
        Gen->>FS: Write article file
    end

    Gen->>FS: Write metadata.json
    GHA->>GHA: Commit and push changes
    GHA->>GHA: Deploy to GitHub Pages
```

### User Request Flow

```mermaid
sequenceDiagram
    participant User as User Browser
    participant CDN as Fastly CDN
    participant Pages as GitHub Pages
    participant Repo as Git Repository

    User->>CDN: GET /index-en.html
    CDN->>Pages: Forward request
    Pages->>Repo: Fetch file
    Repo-->>Pages: File content
    Pages-->>CDN: HTML response
    CDN-->>User: Cached HTML

    User->>CDN: GET /news/week-ahead-2026-02-17-en.html
    CDN-->>User: Cached article (or fetch from Pages)
```

---

## 🎯 Design Principles

### 1. Security by Design

- **Minimal Attack Surface**: Static architecture eliminates server-side
  vulnerabilities
- **No Runtime Execution**: Pure HTML/CSS/JS with no backend processing
- **Content Security Policy**: Strict CSP headers prevent XSS
- **HTTPS Only**: All content delivered over HTTPS

### 2. Separation of Concerns

- **Generation**: News generation scripts (Node.js)
- **Presentation**: Static HTML/CSS/JS
- **Data Access**: MCP Client abstraction
- **Infrastructure**: GitHub-managed CI/CD and hosting

### 3. Multi-Language First

- **14 Languages Supported**: Full European language coverage
- **Language-Specific Indexes**: Separate navigation for each language
- **SEO Per Language**: Individual sitemaps and metadata

### 4. Maintainability

- **Zero Dependencies**: No runtime dependencies, only dev dependencies
- **Standard Technologies**: HTML5, CSS3, vanilla JavaScript
- **Comprehensive Testing**: Unit, integration, and E2E tests
- **Documentation**: Architecture, security, and process docs

### 5. Scalability

- **Static Content**: Infinite scalability via CDN
- **No Database**: No scaling bottlenecks
- **Cacheable**: All content highly cacheable
- **GitHub Infrastructure**: Leverages GitHub's global infrastructure

---

## 📈 System Qualities

### Performance

- **Cold Start**: N/A (static site, no cold starts)
- **Page Load**: < 1s (static HTML, CDN cached)
- **Build Time**: ~5-10 minutes (generation for all languages)
- **Deployment Time**: < 1 minute (GitHub Pages deploy)

### Availability

- **Target**: 99.9% (GitHub Pages SLA)
- **Redundancy**: Fastly CDN with multiple POPs
- **Failover**: Automatic via GitHub infrastructure
- **Monitoring**: GitHub Status page

### Security

- **Attack Surface**: Minimal (static files only)
- **Vulnerability Scanning**: Daily (Dependabot + npm audit)
- **SAST**: Weekly (CodeQL)
- **Compliance**: ISO 27001, GDPR, NIS2, EU CRA aligned

### Maintainability

- **Code Complexity**: Low (simple scripts, no frameworks)
- **Test Coverage**: 82%+ lines, 83%+ branches
- **Documentation**: Comprehensive (10+ architecture docs)
- **Dependencies**: Zero production, 17 dev dependencies

---

## 🔗 Related Documentation

- **[Security Architecture](SECURITY_ARCHITECTURE.md)** - Detailed security
  implementation and threat model
- **[Future Architecture](FUTURE_ARCHITECTURE.md)** - Architectural evolution
  roadmap
- **[Data Model](DATA_MODEL.md)** - Data structures and EP API integration
- **[Flowcharts](FLOWCHART.md)** - Detailed process workflows
- **[State Diagrams](STATEDIAGRAM.md)** - System state transitions
- **[Mindmaps](MINDMAP.md)** - Conceptual system relationships
- **[SWOT Analysis](SWOT.md)** - Strategic analysis and positioning
- **[README.md](README.md)** - Getting started guide and features overview

---

<div class="architecture-footer">

**Document Status:** Living Document  
**Last Updated:** 2026-02-17  
**Next Review:** 2026-05-17  
**Owner:** Security Architect / CTO

This architecture documentation follows the [C4 model](https://c4model.com/)
methodology and complies with
[Hack23 ISMS Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md).

</div>
