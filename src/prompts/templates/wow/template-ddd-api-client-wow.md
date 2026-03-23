# 🎯 DDD Infrastructure Layer - API Clients - {{PackageName}} Package (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

> This document defines the outbound API Client patterns and guidelines for the `{{PackageName}}` package following DDD architectural principles (Ports & Adapters / Hexagonal Architecture).
>
> **Related templates**: `template-ddd-repository-wow.md` | `template-ddd-event-producer-wow.md`

---

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#-architecture-position)
3. [📐 Core Patterns and Rules](#-core-patterns-and-rules)
4. [🗺️ Request / Response Mapping to Domain](#-request--response-mapping-to-domain)
5. [♻️ Retry & Circuit Breaker Strategy](#-retry--circuit-breaker-strategy)
6. [🔑 Authentication Propagation](#-authentication-propagation)
7. [⏱️ Timeout Configuration](#-timeout-configuration)
8. [🛠️ Implementation Guidelines](#-implementation-guidelines)
9. [⚠️ Error Handling Strategy](#-error-handling-strategy)
10. [🧪 Testing Approach](#-testing-approach)
11. [⚡ Performance Considerations](#-performance-considerations)
12. [🔒 Security Guidelines](#-security-guidelines)
13. [📝 Implementation Notes](#-implementation-notes)
14. [🚫 Anti-Patterns to Avoid](#-anti-patterns-to-avoid)
15. [Summary](#summary)
16. [Pattern Index](#pattern-index)
17. [❓ Open Questions](#-open-questions)

---

## 📌 Overview

**Package:** `{{PackageName}}`  
**Description:** {{PackageDescription}}  
**Responsibility:** {{PrimaryResponsibility}}

**Domain Purpose:** {{DomainPurpose}}

**Architecture Layer:** Infrastructure Layer - Outbound API Clients  
**Port Implemented:** `{{ApiClientPortInterface}}` _(defined in domain/application layer)_

---

## 🏗️ Architecture Position

```
Application Layer (Port: {{ApiClientPortInterface}}) → API Client ({{PackageName}}) → {{ExternalServiceName}} ({{BaseUrl}})
```

The `{{PackageName}}` API clients are adapters that implement outbound port interfaces defined in the application layer. They translate domain-level calls into HTTP requests, manage retries and circuit breaking, and convert HTTP responses back into domain objects.

### Package Structure Convention
_[Describe the package naming and organization pattern]_

Examples:
- _[Add 2-3 generic examples of package structure]_

---

## 📐 Core Patterns and Rules

### Categories Analyzed

| Category          | Description              |
|-------------------|--------------------------|
| **{{Category1}}** | {{CategoryDescription1}} |
| **{{Category2}}** | {{CategoryDescription2}} |

---

### Rules by Category

#### {{CategoryName}}

**Total Patterns Found**: {{PatternCount}}

{{#PatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**✅ GOOD - {{UseCasePatternDescription}}:**
```kotlin
{{GoodPatternExample}}
```
**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**Key Benefits:**
{{#Benefits}}
- **{{BenefitName}}**: {{BenefitDescription}}
{{/Benefits}}

**❌ BAD - {{UseCaseAntiPatternDescription}}:**
```kotlin
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}
- {{Reason}}
{{/AntiPatternReasons}}

{{/PatternRules}}

---

## 🗺️ Request / Response Mapping to Domain

### Outbound Request Mapping
- **Request DTO Strategy**: {{RequestDtoStrategy}} (e.g., dedicated HTTP request DTOs, reuse of domain commands)
- **URL Construction**: {{UrlConstructionStrategy}}
- **Header Mapping**: {{HeaderMappingStrategy}}
- **Query Parameter Mapping**: {{QueryParameterStrategy}}

### Inbound Response Mapping
- **Response DTO Strategy**: {{ResponseDtoStrategy}} (e.g., dedicated HTTP response DTOs, direct domain mapping)
- **Domain Object Construction**: {{DomainObjectConstructionStrategy}}
- **Partial Response Handling**: {{PartialResponseStrategy}}
- **Empty / 404 Handling**: {{EmptyResponseHandling}}

{{#MappingPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**✅ GOOD - {{PatternDescription}}:**
```kotlin
{{GoodPatternExample}}
```
**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**❌ BAD - {{AntiPatternDescription}}:**
```kotlin
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}
- {{Reason}}
{{/AntiPatternReasons}}

{{/MappingPatternRules}}

---

## ♻️ Retry & Circuit Breaker Strategy

### Retry Policy
- **Max Attempts**: {{MaxRetryAttempts}}
- **Backoff Strategy**: {{BackoffStrategy}} (e.g., exponential with jitter)
- **Retriable HTTP Status Codes**: {{RetriableStatusCodes}} (e.g., 429, 502, 503, 504)
- **Non-Retriable HTTP Status Codes**: {{NonRetriableStatusCodes}} (e.g., 400, 401, 403, 404)

### Circuit Breaker
- **Circuit Breaker Mechanism**: {{CircuitBreakerMechanism}} (e.g., Resilience4j, Spring Cloud Circuit Breaker)
- **Failure Threshold**: {{FailureThreshold}}
- **Open State Behavior**: {{OpenStateBehavior}} (e.g., fallback, exception, cached response)
- **Half-Open Probe Strategy**: {{HalfOpenProbeStrategy}}

**Example:**
```kotlin
{{RetryCircuitBreakerExample}}
```

---

## 🔑 Authentication Propagation

### Auth Strategy
- **Auth Mechanism**: {{AuthMechanism}} (e.g., Bearer token, API key, OAuth2 client credentials, mTLS)
- **Token Source**: {{TokenSource}} (e.g., SecurityContext, dedicated token provider, environment variable)
- **Token Refresh**: {{TokenRefreshStrategy}}
- **Header Injection**: {{AuthHeaderInjectionStrategy}}

{{#AuthPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**✅ GOOD - {{PatternDescription}}:**
```kotlin
{{GoodPatternExample}}
```
**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**❌ BAD - {{AntiPatternDescription}}:**
```kotlin
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}
- {{Reason}}
{{/AntiPatternReasons}}

{{/AuthPatternRules}}

---

## ⏱️ Timeout Configuration

### Timeout Strategy
- **Connection Timeout**: {{ConnectionTimeout}}
- **Read Timeout**: {{ReadTimeout}}
- **Per-Endpoint Overrides**: {{PerEndpointTimeoutOverrides}}
- **Timeout Failure Behavior**: {{TimeoutFailureBehavior}} (e.g., exception, circuit breaker open)

---

## 🛠️ Implementation Guidelines

### Dependency Injection
- **{{DIPattern}}**: {{DIDescription}}
- **HTTP Client Configuration**: {{HttpClientConfiguration}}
- **Base URL Configuration**: {{BaseUrlConfiguration}}

### Port Implementation Rules
- **Interface Compliance**: {{InterfaceComplianceDescription}}
- **Domain Isolation**: {{DomainIsolationDescription}}

{{#ImplementationGuidelines}}
### {{GuidelineName}}
{{GuidelineDescription}}

{{/ImplementationGuidelines}}

---

## ⚠️ Error Handling Strategy

### HTTP Error to Domain Exception Translation

| HTTP Status | Domain Exception | Description |
|---|---|---|
| `{{HttpStatus1}}` | `{{DomainException1}}` | {{ExceptionDescription1}} |
| `{{HttpStatus2}}` | `{{DomainException2}}` | {{ExceptionDescription2}} |
| `{{HttpStatus3}}` | `{{DomainException3}}` | {{ExceptionDescription3}} |

### Timeout & Network Error Handling
{{TimeoutNetworkErrorHandling}}

**Example:**
```kotlin
{{ErrorTranslationExample}}
```

### {{ErrorLoggingPattern}}
{{ErrorLoggingDescription}}

---

## 🧪 Testing Approach

### Unit Testing
- **{{UnitTestPattern}}**: {{UnitTestDescription}}
- **Mock Strategy**: {{MockStrategy}}
- **Coverage Target**: {{CoverageTarget}}

### Integration Testing (WireMock / MockServer)
- **{{IntegrationTestPattern}}**: {{IntegrationTestDescription}}
- **Test Environment**: {{TestEnvironment}} (e.g., WireMock, MockServer, Testcontainers)
- **Stub Strategy**: {{StubStrategy}}

### Contract Testing
- **{{ContractTestPattern}}**: {{ContractTestDescription}}
- **Provider Verification**: {{ProviderVerificationStrategy}}

### API Client Testing Rules

{{#GoodTestExamples}}
#### ✅ Good Test Structure
```kotlin
{{GoodTestExample}}
```

{{/GoodTestExamples}}

{{#BadTestExamples}}
#### ❌ Bad Test Patterns
```kotlin
{{BadTestExample}}
```

{{/BadTestExamples}}

---

## ⚡ Performance Considerations

### Connection Pooling
- **{{ConnectionPoolPattern}}**: {{ConnectionPoolDescription}}

### Response Caching
- **{{CachingPattern}}**: {{CachingDescription}}

{{#PerformancePatterns}}
### {{PerformancePatternName}}
{{PerformancePatternDescription}}

{{/PerformancePatterns}}

---

## 🔒 Security Guidelines

### SSRF Prevention
- **URL Allowlist**: {{UrlAllowlistStrategy}} — only pre-configured base URLs are permitted; never construct URLs from user input
- **{{SsrfPreventionPattern}}**: {{SsrfPreventionDescription}}

### TLS / Certificate Validation
- **{{TlsPattern}}**: {{TlsDescription}}
- **Certificate Pinning**: {{CertificatePinningStrategy}}
- **Mutual TLS (mTLS)**: {{MtlsStrategy}}

### Credentials & Secret Management
- **{{CredentialPattern}}**: {{CredentialDescription}}
- **Secret Storage**: {{SecretStorageStrategy}} (e.g., Vault, AWS Secrets Manager, environment variables)
- **Credential Rotation**: {{CredentialRotationStrategy}}

### Sensitive Data in Requests
- **{{SensitiveDataPattern}}**: {{SensitiveDataDescription}}
- **Logging Redaction**: {{LoggingRedactionStrategy}} — never log auth headers, tokens, or PII

{{#SecurityPatterns}}
### {{SecurityPatternName}}
{{SecurityPatternDescription}}

{{/SecurityPatterns}}

---

## 📝 Implementation Notes

{{#ImplementationNotes}}
### {{ImplementationNoteName}}
{{ImplementationNoteDescription}}

{{/ImplementationNotes}}

---

## 🚫 Anti-Patterns to Avoid

{{#AntiPatterns}}
### ❌ {{AntiPatternName}}
**Problem:** {{AntiPatternProblem}}  
**Solution:** {{AntiPatternSolution}}

{{/AntiPatterns}}

---

## Summary

**Key Implementation Principles** _(actionable guidelines for developers)_

{{SummaryIntroduction}}

1. **{{KeyPrinciple1}}** - {{KeyPrinciple1Description}}
2. **{{KeyPrinciple2}}** - {{KeyPrinciple2Description}}
3. **{{KeyPrinciple3}}** - {{KeyPrinciple3Description}}
4. **{{KeyPrinciple4}}** - {{KeyPrinciple4Description}}
5. **{{KeyPrinciple5}}** - {{KeyPrinciple5Description}}
- **DDD Patterns:** {{DDDPatternReferences}}
- **Architecture Documentation:** {{ArchitectureDocumentation}}

**What to Avoid** _(common anti-patterns and restrictions)_

{{WhatToAvoid}}

---

## Pattern Index

{{#PatternCategories}}
### {{CategoryName}} Patterns
{{#Patterns}}
{{PatternIndex}}. **{{PatternId}}**: {{PatternName}} - [{{ClassIndexIdentifier}}] {{FileName}}
{{/Patterns}}

{{/PatternCategories}}

### Coverage Summary
**Total Infrastructure API Clients Analyzed**: {{TotalInterfaceCount}}
{{#CoverageByCategory}}
- **{{CategoryName}}**: {{InterfaceCount}} clients ({{CoveragePercentage}}% coverage)
{{/CoverageByCategory}}

**Key Files Analyzed**:
{{#AnalyzedFiles}}
- [{{ClassIndexIdentifier}}] {{FileName}} ✓
{{/AnalyzedFiles}}

---

## ❓ Open Questions

{{#OpenQuestions}}
- [ ] {{OpenQuestion}}
{{/OpenQuestions}}

---

> **⚠️ TEMPLATE INSTRUCTIONS BELOW THIS POINT - DO NOT INCLUDE THIS SECTION IN FINAL DOCUMENTS**

Use @context/templates/ai-development/ai-definitions/ddd-discovery/definition-template-generic-id-management-guidelines.md for pattern ID management.

## Template Variables Reference

### Pattern Definition Variables
- `{{PatternCount}}` - Total number of patterns found in analysis
- `{{PatternRules}}` - Array of core pattern rule objects
- `{{MappingPatternRules}}` - Array of request/response mapping pattern rules
- `{{AuthPatternRules}}` - Array of authentication pattern rules
- `{{PatternCategories}}` - Array of pattern category objects with nested patterns
- `{{PatternId}}` - Unique pattern identifier (e.g., "API-MAP-01", "API-RTY-01")
- `{{PatternName}}` - Descriptive name of the pattern
- `{{ClassIndexIdentifier}}` - Hash identifier from class index (e.g., "a1b2c3d4e5f6")
- `{{FileName}}` - Source file name (e.g., "HttpOrderServiceClient.kt")
- `{{Benefits}}` - Array of benefit objects with BenefitName and BenefitDescription
- `{{AntiPatternReasons}}` - Array of reason strings for anti-pattern explanations
- `{{SourceFiles}}` - Array of source file objects with ClassIndexIdentifier and FileName

### API Client-Specific Variables
- `{{ApiClientPortInterface}}` - Name of the port interface this client implements
- `{{ExternalServiceName}}` - Name of the external service being called
- `{{BaseUrl}}` - Base URL of the external service (configured, not hardcoded)
- `{{AuthMechanism}}` - Authentication mechanism used
- `{{MaxRetryAttempts}}` - Maximum number of retry attempts
- `{{RetriableStatusCodes}}` - HTTP status codes that trigger a retry
- `{{CircuitBreakerMechanism}}` - Circuit breaker library/mechanism
- `{{ConnectionTimeout}}` - Connection timeout value
- `{{ReadTimeout}}` - Read timeout value

### Error Mapping Variables
- `{{HttpStatus1}}` - HTTP status code (e.g., "404 Not Found")
- `{{DomainException1}}` - Domain exception class (e.g., "OrderNotFoundException")
- `{{ExceptionDescription1}}` - Description of when this exception is thrown

### Coverage Summary Variables
- `{{TotalInterfaceCount}}` - Total number of API clients analyzed
- `{{CoverageByCategory}}` - Array of coverage objects with CategoryName, InterfaceCount, and CoveragePercentage

## Usage Instructions

### 1. Pattern Identification
For each API client pattern found in your analysis:
1. Assign a unique pattern ID following the format: `API-{{CategoryPrefix}}-{{Number}}`
   - `API-MAP-XX`: Request/response mapping and domain translation patterns
   - `API-RTY-XX`: Retry and circuit breaker patterns
   - `API-AUTH-XX`: Authentication and token propagation patterns
   - `API-ERR-XX`: Error handling and HTTP status translation patterns
   - `API-TMO-XX`: Timeout and resilience configuration patterns

2. Create descriptive pattern names that capture the architectural intent
3. Reference the source file using the class index identifier

### 2. What to Analyze
- **Port Implementation**: How the client implements the domain outbound port
- **Request DTO Isolation**: Whether HTTP request structures are decoupled from domain objects
- **Response Mapping**: How HTTP responses are converted to domain objects
- **Retry Logic**: Max attempts, backoff strategy, retriable status codes
- **Circuit Breaker**: Mechanism, thresholds, open state behavior
- **Auth Handling**: Token source, injection strategy, refresh logic
- **Error Translation**: HTTP status code to domain exception mapping

### 3. Pattern Naming Conventions

#### Good Pattern Names
- ✅ **Resilience4j Circuit Breaker with Fallback Pattern** - Describes resilience approach
- ✅ **Dedicated HTTP DTO Translation Pattern** - Describes domain isolation
- ✅ **Bearer Token Injection via Request Interceptor Pattern** - Describes auth propagation
- ✅ **HTTP Status to Domain Exception Translation Pattern** - Describes error mapping

#### Bad Pattern Names
- ❌ **REST Client Pattern** - Too generic
- ❌ **Feign Pattern** - Too technology-specific
- ❌ **HTTP Pattern** - Vague

### 4. API Client Analysis Guidelines

#### What to Look For
- **Port Compliance**: Client class implements the domain outbound port interface
- **Domain Isolation**: HTTP-specific types (response codes, headers) never reach the application layer
- **SSRF Safety**: Base URLs are configuration-driven; no user-controlled URL construction
- **Resilience**: Retries, circuit breaker, and timeouts are configured for every client
- **Auth Security**: Credentials come from secret management, not hardcoded values

#### Anti-Patterns to Identify
- **Domain Leakage**: HTTP response objects passed to or from the application layer
- **Hardcoded URLs**: Base URLs embedded in code instead of configuration
- **User-Input URLs**: SSRF risk — never construct URLs from unvalidated external input
- **Missing Timeouts**: No connection or read timeout causes thread exhaustion
- **Logging Sensitive Headers**: Auth tokens or API keys written to logs
- **Missing Circuit Breaker**: No protection against cascading failures from downstream

### 5. Template Completion Checklist

- [ ] All API client files analyzed and catalogued
- [ ] Port interface identified for each client
- [ ] Pattern IDs assigned following `API-XX-XX` convention
- [ ] Request/response mapping patterns documented
- [ ] HTTP status to domain exception mapping table completed
- [ ] Retry policy (attempts, backoff, retriable codes) documented
- [ ] Circuit breaker mechanism and thresholds documented
- [ ] Authentication mechanism and token propagation documented
- [ ] Timeout values (connection, read) documented
- [ ] Good/bad examples provided for major patterns
- [ ] Source references include class index identifiers
- [ ] Security section completed (SSRF, TLS, credentials, sensitive data logging)
- [ ] WireMock / contract testing approach described
- [ ] Performance (connection pooling, caching) addressed
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines
