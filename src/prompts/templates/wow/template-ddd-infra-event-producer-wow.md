# 🎯 DDD Infrastructure Layer - Event Producers - {{PackageName}} Package (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

> This document defines the Event Producer implementation patterns and guidelines for the `{{PackageName}}` package following DDD architectural principles (Ports & Adapters / Hexagonal Architecture).
>
> **Related templates**: `template-ddd-repository-wow.md` | `template-ddd-api-client-wow.md`

---

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#-architecture-position)
3. [📐 Core Patterns and Rules](#-core-patterns-and-rules)
4. [📤 Event Serialization Strategy](#-event-serialization-strategy)
5. [🗺️ Topic / Exchange Routing](#-topic--exchange-routing)
6. [🔁 Idempotency & Delivery Guarantees](#-idempotency--delivery-guarantees)
7. [♻️ Retry & Error Routing](#-retry--error-routing)
8. [📐 Schema Evolution Strategy](#-schema-evolution-strategy)
9. [🛠️ Implementation Guidelines](#-implementation-guidelines)
10. [⚠️ Error Handling Strategy](#-error-handling-strategy)
11. [🧪 Testing Approach](#-testing-approach)
12. [⚡ Performance Considerations](#-performance-considerations)
13. [🔒 Security Guidelines](#-security-guidelines)
14. [📝 Implementation Notes](#-implementation-notes)
15. [🚫 Anti-Patterns to Avoid](#-anti-patterns-to-avoid)
16. [Summary](#summary)
17. [Pattern Index](#pattern-index)
18. [❓ Open Questions](#-open-questions)

---

## 📌 Overview

**Package:** `{{PackageName}}`  
**Description:** {{PackageDescription}}  
**Responsibility:** {{PrimaryResponsibility}}

**Domain Purpose:** {{DomainPurpose}}

**Architecture Layer:** Infrastructure Layer - Event Producers  
**Port Implemented:** `{{EventPublisherPortInterface}}` _(defined in domain/application layer)_

---

## 🏗️ Architecture Position

```
Application Layer (Port: {{EventPublisherPortInterface}}) → Event Producer ({{PackageName}}) → {{BrokerTechnology}} ({{TopicNames}})
```

The `{{PackageName}}` event producers are adapters that implement event publisher ports defined in the application layer. They translate domain events into broker-specific messages, managing serialization, routing, and delivery guarantees.

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
```
{{GoodPatternExample}}
```
**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**Key Benefits:**
{{#Benefits}}
- **{{BenefitName}}**: {{BenefitDescription}}
{{/Benefits}}

**❌ BAD - {{UseCaseAntiPatternDescription}}:**
```
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}
- {{Reason}}
{{/AntiPatternReasons}}

{{/PatternRules}}

---

## 📤 Event Serialization Strategy

### Serialization Approach
- **Format**: {{SerializationFormat}} (e.g., JSON, Avro, Protobuf)
- **Schema Registry**: {{SchemaRegistryUsage}} (e.g., Confluent Schema Registry, none)
- **Event Envelope**: {{EventEnvelopeStructure}} (e.g., metadata headers, wrapper object)
- **Null Handling**: {{NullHandlingStrategy}}

{{#SerializationPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**✅ GOOD - {{PatternDescription}}:**
```
{{GoodPatternExample}}
```
**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**❌ BAD - {{AntiPatternDescription}}:**
```
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}
- {{Reason}}
{{/AntiPatternReasons}}

{{/SerializationPatternRules}}

---

## 🗺️ Topic / Exchange Routing

### Routing Strategy
- **Topic Naming Convention**: {{TopicNamingConvention}}
- **Routing Key Strategy**: {{RoutingKeyStrategy}} (e.g., aggregate ID, event type, partition key)
- **Dynamic vs. Static Routing**: {{DynamicVsStaticRouting}}
- **Multi-Topic Publishing**: {{MultiTopicPublishingStrategy}}

**Topic mapping table:**

| Domain Event | Topic / Exchange | Routing Key |
|---|---|---|
| `{{DomainEvent1}}` | `{{Topic1}}` | `{{RoutingKey1}}` |
| `{{DomainEvent2}}` | `{{Topic2}}` | `{{RoutingKey2}}` |

---

## 🔁 Idempotency & Delivery Guarantees

### Delivery Guarantee
- **Guarantee Level**: {{DeliveryGuarantee}} (e.g., at-least-once, exactly-once, at-most-once)
- **Idempotency Key**: {{IdempotencyKeySource}} (e.g., aggregate ID + event sequence, UUID)
- **Producer Transactions**: {{ProducerTransactionStrategy}} (e.g., Kafka transactions, outbox pattern)

### Outbox Pattern (if applicable)
- **Outbox Table**: {{OutboxTableDescription}}
- **Polling/Relay Strategy**: {{OutboxRelayStrategy}}
- **Cleanup Policy**: {{OutboxCleanupPolicy}}

{{#IdempotencyPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**✅ GOOD - {{PatternDescription}}:**
```
{{GoodPatternExample}}
```
**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**❌ BAD - {{AntiPatternDescription}}:**
```
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}
- {{Reason}}
{{/AntiPatternReasons}}

{{/IdempotencyPatternRules}}

---

## ♻️ Retry & Error Routing

### Retry Strategy
- **Retry Policy**: {{RetryPolicy}} (e.g., exponential backoff, max attempts)
- **Retriable vs. Non-Retriable Errors**: {{RetriableErrorClassification}}
- **Dead Letter Topic**: {{DeadLetterTopicName}}
- **Alerting on DLT**: {{DeadLetterAlertingStrategy}}

**Example:**
```
{{RetryErrorRoutingExample}}
```

---

## 📐 Schema Evolution Strategy

### Backward / Forward Compatibility
- **Compatibility Mode**: {{SchemaCompatibilityMode}} (e.g., backward, forward, full)
- **Field Addition Rules**: {{FieldAdditionRules}}
- **Field Removal Rules**: {{FieldRemovalRules}}
- **Breaking Change Process**: {{BreakingChangeProcess}}

---

## 🛠️ Implementation Guidelines

### Dependency Injection
- **{{DIPattern}}**: {{DIDescription}}
- **Configuration**: {{ConfigurationApproach}}
- **Lifecycle**: {{LifecycleManagement}}

### Port Implementation Rules
- **Interface Compliance**: {{InterfaceComplianceDescription}}
- **Domain Event Isolation**: {{DomainEventIsolationDescription}}

{{#ImplementationGuidelines}}
### {{GuidelineName}}
{{GuidelineDescription}}

{{/ImplementationGuidelines}}

---

## ⚠️ Error Handling Strategy

### Send Failure Handling
{{SendFailureStrategy}}

**Example:**
```
{{SendFailureExample}}
```

### Transactional Outbox Failure
{{OutboxFailureStrategy}}

### {{ErrorLoggingPattern}}
{{ErrorLoggingDescription}}

---

## 🧪 Testing Approach

### Unit Testing
- **{{UnitTestPattern}}**: {{UnitTestDescription}}
- **Mock Strategy**: {{MockStrategy}}
- **Coverage Target**: {{CoverageTarget}}

### Integration Testing (Embedded Broker / Testcontainers)
- **{{IntegrationTestPattern}}**: {{IntegrationTestDescription}}
- **Test Environment**: {{TestEnvironment}} (e.g., Testcontainers Kafka, Embedded RabbitMQ)
- **Message Assertion**: {{MessageAssertionStrategy}}

### Contract Testing
- **{{ContractTestPattern}}**: {{ContractTestDescription}}
- **Schema Validation**: {{SchemaValidationInTests}}

### Producer Testing Rules

{{#GoodTestExamples}}
#### ✅ Good Test Structure
```
{{GoodTestExample}}
```

{{/GoodTestExamples}}

{{#BadTestExamples}}
#### ❌ Bad Test Patterns
```
{{BadTestExample}}
```

{{/BadTestExamples}}

---

## ⚡ Performance Considerations

### Batching Strategy
- **{{BatchingPattern}}**: {{BatchingDescription}}

### Async Publishing
- **{{AsyncPattern}}**: {{AsyncDescription}}

{{#PerformancePatterns}}
### {{PerformancePatternName}}
{{PerformancePatternDescription}}

{{/PerformancePatterns}}

---

## 🔒 Security Guidelines

### Schema Validation
- **{{SchemaValidationPattern}}**: {{SchemaValidationDescription}}

### Credentials & Connection Security
- **{{CredentialPattern}}**: {{CredentialDescription}}
- **TLS/mTLS**: {{TlsConfiguration}}
- **Secret Management**: {{SecretManagementStrategy}}

### Sensitive Data in Events
- **{{SensitiveDataPattern}}**: never include PII or secrets in event payloads unless encrypted
- **Data Minimization**: {{DataMinimizationStrategy}}

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
**Total Infrastructure Event Producers Analyzed**: {{TotalInterfaceCount}}
{{#CoverageByCategory}}
- **{{CategoryName}}**: {{InterfaceCount}} producers ({{CoveragePercentage}}% coverage)
{{/CoverageByCategory}}

**Key Files Analyzed**:
{{#AnalyzedFiles}}
- [{{ClassIndexIdentifier}}] {{FileName}} ✓
{{/AnalyzedFiles}}
{{#AdjacentCollaborators}}
- [{{ClassIndexIdentifier}}] {{FileName}} _(adjacent collaborator)_
{{/AdjacentCollaborators}}

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
- `{{SerializationPatternRules}}` - Array of serialization pattern rules
- `{{IdempotencyPatternRules}}` - Array of idempotency pattern rules
- `{{PatternCategories}}` - Array of pattern category objects with nested patterns
- `{{PatternId}}` - Unique pattern identifier (e.g., "PRD-SER-01", "PRD-IDM-01")
- `{{PatternName}}` - Descriptive name of the pattern
- `{{ClassIndexIdentifier}}` - Hash identifier from class index (e.g., "a1b2c3d4e5f6")
- `{{FileName}}` - Source file name (e.g., "OrderEventProducer.ext")

### Producer-Specific Variables
- `{{EventPublisherPortInterface}}` - Name of the port interface this producer implements
- `{{BrokerTechnology}}` - Message broker (e.g., "Kafka", "RabbitMQ", "SNS/SQS")
- `{{TopicNames}}` - Comma-separated list of topics/exchanges published to
- `{{SerializationFormat}}` - Serialization format used (e.g., "JSON", "Avro")
- `{{DeliveryGuarantee}}` - Delivery guarantee level
- `{{SchemaCompatibilityMode}}` - Schema evolution mode
- `{{RetryPolicy}}` - Retry configuration
- `{{DeadLetterTopicName}}` - DLT name for failed messages

### Coverage Summary Variables
- `{{TotalInterfaceCount}}` - Total number of producers analyzed
- `{{CoverageByCategory}}` - Array of coverage objects with CategoryName, InterfaceCount, and CoveragePercentage

## Usage Instructions

### 1. Pattern Identification
For each event producer pattern found in your analysis:
1. Assign a unique pattern ID following the format: `PRD-{{CategoryPrefix}}-{{Number}}`
   - `PRD-SER-XX`: Serialization and event envelope patterns
   - `PRD-RTE-XX`: Topic routing and key strategy patterns
   - `PRD-IDM-XX`: Idempotency and delivery guarantee patterns
   - `PRD-ERR-XX`: Error handling and error routing patterns
   - `PRD-SCH-XX`: Schema evolution patterns

2. Create descriptive pattern names that capture the architectural intent
3. Reference the source file using the class index identifier

### 2. What to Analyze
- **Port Implementation**: How the producer implements the event publisher port
- **Domain Event Isolation**: Whether domain events are translated to DTOs before publishing
- **Serialization**: Format, schema registry usage, envelope structure
- **Routing**: Topic naming convention, partition key selection
- **Delivery Guarantees**: At-least-once, exactly-once, outbox pattern
- **Error Handling**: Retry, DLT routing, transactional guarantees

### 3. Pattern Naming Conventions

#### Good Pattern Names
- ✅ **Transactional Outbox Pattern** - Describes exactly-once guarantee approach
- ✅ **Domain Event to Message DTO Translation Pattern** - Describes isolation
- ✅ **Aggregate-Based Partition Key Pattern** - Describes ordering guarantee
- ✅ **Schema Registry Validation Pattern** - Describes schema enforcement

#### Bad Pattern Names
- ❌ **Kafka Producer Pattern** - Too technology-specific
- ❌ **Send Pattern** - Too generic
- ❌ **Publisher Pattern** - Vague

### 4. Producer Analysis Guidelines

#### What to Look For
- **Port Compliance**: Producer class implements the domain event publisher interface
- **Domain Event Isolation**: Domain events converted to message DTOs before publishing
- **Delivery Guarantee Chosen**: At-least-once vs. exactly-once and why
- **Idempotency Key Present**: Events carry a stable, reproducible ID
- **No Business Logic**: Producers only serialize and route — no domain decisions

#### Anti-Patterns to Identify
- **Domain Event as Message**: Publishing raw domain event objects (tight coupling)
- **Fire and Forget**: No error handling, no retry, no DLT for failed sends
- **Missing Idempotency Key**: Events without stable IDs prevent consumer deduplication
- **Business Logic in Producer**: Routing decisions based on domain rules
- **PII in Event Payload**: Sensitive data in unencrypted event fields

### 5. Template Completion Checklist

- [ ] All producer files analyzed and catalogued
- [ ] Port interface identified for each producer
- [ ] Pattern IDs assigned following `PRD-XX-XX` convention
- [ ] Serialization format and schema registry usage documented
- [ ] Topic routing table completed
- [ ] Delivery guarantee level documented
- [ ] Idempotency key source documented
- [ ] Outbox pattern documented if used
- [ ] Retry and DLT configuration documented
- [ ] Schema evolution strategy documented
- [ ] Good/bad examples provided for major patterns
- [ ] Source references include class index identifiers
- [ ] Security section completed (credentials, TLS, sensitive data, schema validation)
- [ ] Testcontainers / contract testing approach described
- [ ] Performance (batching, async) addressed
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines
