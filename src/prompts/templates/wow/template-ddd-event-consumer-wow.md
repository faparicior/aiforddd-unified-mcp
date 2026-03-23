# 🎯 DDD UI Layer - Event Consumers - {{PackageName}} Package (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

> This document defines the Event Consumer patterns and guidelines for the `{{PackageName}}` package following DDD architectural principles.
>
> **Related templates**: `template-ddd-controller-wow.md` (Controllers) | `template-ddd-scheduler-wow.md`

---

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#-architecture-position)
3. [📐 Core Patterns and Rules](#-core-patterns-and-rules)
4. [📨 Message Deserialization Strategy](#-message-deserialization-strategy)
5. [✅ Acknowledgment & Offset Strategy](#-acknowledgment--offset-strategy)
6. [🔁 Idempotency Handling](#-idempotency-handling)
7. [💀 Dead Letter Strategy](#-dead-letter-strategy)
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

**Architecture Layer:** UI Layer - Event Consumers

---

## 🏗️ Architecture Position

```
Message Broker ({{BrokerType}}) → Event Consumer ({{PackageName}}) → Application Layer ({{ApplicationComponents}}) → Domain Layer
```

The `{{PackageName}}` consumers sit at the messaging boundary, translating incoming events into application layer commands, managing acknowledgment lifecycle and ensuring reliable, idempotent processing.

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

## 📨 Message Deserialization Strategy

### Deserialization Approach
- **{{DeserializationPattern}}**: {{DeserializationDescription}}
- **Schema Registry**: {{SchemaRegistryStrategy}}
- **Unknown Fields**: {{UnknownFieldsHandling}}
- **Version Tolerance**: {{VersionToleranceStrategy}}

{{#DeserializationPatternRules}}
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

{{/DeserializationPatternRules}}

---

## ✅ Acknowledgment & Offset Strategy

### Acknowledgment Mode
- **Mode**: {{AcknowledgmentMode}} (e.g., manual, auto)
- **When to Acknowledge**: {{AcknowledgmentTiming}}
- **Failure Behavior**: {{AcknowledgmentFailureBehavior}}

### Offset Management
- **{{OffsetManagementPattern}}**: {{OffsetManagementDescription}}
- **Commit Strategy**: {{OffsetCommitStrategy}}
- **Reprocessing Handling**: {{ReprocessingHandling}}

---

## 🔁 Idempotency Handling

### Idempotency Strategy
- **Idempotency Key Source**: {{IdempotencyKeySource}} (e.g., message ID, correlation ID)
- **Deduplication Store**: {{DeduplicationStore}} (e.g., Redis, DB table)
- **TTL / Expiry**: {{IdempotencyTtl}}

{{#IdempotencyPatternRules}}
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

{{/IdempotencyPatternRules}}

---

## 💀 Dead Letter Strategy

### Dead Letter Queue / Topic Configuration
- **DLQ/DLT Name**: {{DeadLetterTopicName}}
- **Retry Policy**: {{RetryPolicy}} (e.g., max attempts, backoff)
- **DLQ Processing**: {{DeadLetterProcessingStrategy}}
- **Alerting**: {{DeadLetterAlertingStrategy}}

**Example DLQ configuration:**
```kotlin
{{DeadLetterConfigExample}}
```

---

## 🛠️ Implementation Guidelines

### Dependency Injection
- **{{DIPattern}}**: {{DIDescription}}
- **Configuration**: {{ConfigurationApproach}}
- **Lifecycle**: {{LifecycleManagement}}

### Concurrency & Partition Assignment
- **{{ConcurrencyPattern}}**: {{ConcurrencyDescription}}
- **Partition Strategy**: {{PartitionStrategy}}

{{#ImplementationGuidelines}}
### {{GuidelineName}}
{{GuidelineDescription}}

{{/ImplementationGuidelines}}

---

## ⚠️ Error Handling Strategy

### Transient Error Handling (retry)
{{TransientErrorStrategy}}

**Example:**
```kotlin
{{TransientErrorExample}}
```

### Permanent Error Handling (DLQ routing)
{{PermanentErrorStrategy}}

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
- **Test Environment**: {{TestEnvironment}} (e.g., Embedded Kafka, Testcontainers)
- **Data Setup**: {{DataSetupStrategy}}

### Consumer Testing Rules

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

### Throughput & Concurrency
- **{{ThroughputPattern}}**: {{ThroughputDescription}}

### Back-pressure
- **{{BackpressurePattern}}**: {{BackpressureDescription}}

{{#PerformancePatterns}}
### {{PerformancePatternName}}
{{PerformancePatternDescription}}

{{/PerformancePatterns}}

---

## 🔒 Security Guidelines

### Message Validation (Poison Pill Prevention)
- **{{MessageValidationPattern}}**: {{MessageValidationDescription}}
- **Schema Enforcement**: {{SchemaEnforcementDescription}}

### Topic Access Control
- **{{AccessControlPattern}}**: {{AccessControlDescription}}

### Sensitive Data in Messages
- **{{SensitiveDataPattern}}**: {{SensitiveDataDescription}}

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
**Total UI Layer Event Consumers Analyzed**: {{TotalInterfaceCount}}
{{#CoverageByCategory}}
- **{{CategoryName}}**: {{InterfaceCount}} consumers ({{CoveragePercentage}}% coverage)
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
- `{{DeserializationPatternRules}}` - Array of deserialization pattern rules
- `{{IdempotencyPatternRules}}` - Array of idempotency pattern rules
- `{{PatternCategories}}` - Array of pattern category objects with nested patterns
- `{{PatternId}}` - Unique pattern identifier (e.g., "CSM-HDL-01", "CSM-IDM-01")
- `{{PatternName}}` - Descriptive name of the pattern
- `{{ClassIndexIdentifier}}` - Hash identifier from class index (e.g., "a1b2c3d4e5f6")
- `{{FileName}}` - Source file name (e.g., "OrderEventConsumer.kt")
- `{{Benefits}}` - Array of benefit objects with BenefitName and BenefitDescription
- `{{AntiPatternReasons}}` - Array of reason strings for anti-pattern explanations
- `{{SourceFiles}}` - Array of source file objects with ClassIndexIdentifier and FileName

### Messaging-Specific Variables
- `{{BrokerType}}` - Message broker technology (e.g., "Kafka", "RabbitMQ", "SQS")
- `{{AcknowledgmentMode}}` - How messages are acknowledged (e.g., "manual", "auto")
- `{{IdempotencyKeySource}}` - Where the idempotency key comes from
- `{{DeduplicationStore}}` - Storage used for deduplication
- `{{DeadLetterTopicName}}` - Name of the DLQ/DLT
- `{{RetryPolicy}}` - Retry configuration description

### Coverage Summary Variables
- `{{TotalInterfaceCount}}` - Total number of consumers analyzed
- `{{CoverageByCategory}}` - Array of coverage objects with CategoryName, InterfaceCount, and CoveragePercentage

### File Analysis Variables
- `{{AnalyzedFiles}}` - List of all files that were analyzed
- `{{ClassIndexIdentifier}}` - Unique hash for file identification
- `{{FileName}}` - Name of the analyzed file

## Usage Instructions

### 1. Pattern Identification
For each event consumer pattern found in your analysis:
1. Assign a unique pattern ID following the format: `CSM-{{CategoryPrefix}}-{{Number}}`
   - `CSM-HDL-XX`: Message handling and delegation patterns
   - `CSM-DSR-XX`: Deserialization and schema patterns
   - `CSM-IDM-XX`: Idempotency handling patterns
   - `CSM-DLQ-XX`: Dead letter and error routing patterns
   - `CSM-ACK-XX`: Acknowledgment and offset management patterns

2. Create descriptive pattern names that capture the architectural intent
3. Reference the source file using the class index identifier

### 2. What to Analyze
- **Consumer Structure**: Listener annotations, topic/queue binding, consumer group
- **Message Contract**: Event DTO structure, schema version handling, backward compatibility
- **Delegation Pattern**: How consumers translate events into application layer commands
- **Acknowledgment Lifecycle**: When messages are acknowledged relative to processing
- **Idempotency Mechanism**: How duplicate messages are detected and skipped
- **Error Routing**: Retry logic, DLQ configuration, alerting setup

### 3. Pattern Naming Conventions

#### Good Pattern Names
- ✅ **Event-to-Command Translation Pattern** - Describes application layer delegation
- ✅ **Idempotent Processing Gate Pattern** - Describes duplicate detection
- ✅ **Manual Acknowledgment After Processing Pattern** - Describes ack lifecycle
- ✅ **Poison Pill Isolation Pattern** - Describes DLQ routing for bad messages

#### Bad Pattern Names
- ❌ **Kafka Listener Pattern** - Too technology-specific
- ❌ **Consumer Pattern** - Too generic
- ❌ **Message Handler Pattern** - Vague

### 4. Consumer Analysis Guidelines

#### What to Look For
- **Thin Consumer Rule**: Consumers should only deserialize, validate, and delegate — no business logic
- **Idempotency First**: Every consumer must handle duplicate message delivery
- **Late Acknowledgment**: Messages should only be acknowledged after successful processing
- **DLQ Coverage**: Every retry-exhausted failure must route to a dead letter topic

#### Anti-Patterns to Identify
- **Business Logic in Consumer**: Domain rules embedded in the message handler method
- **Auto-Ack Before Processing**: Acknowledging before the use case completes risks data loss
- **Missing Idempotency**: No duplicate detection, causing double processing on redelivery
- **Silent Failure**: Catching exceptions without DLQ routing or alerting
- **Schema Coupling**: Deserializing directly to domain objects instead of event DTOs

### 5. Template Completion Checklist

- [ ] All consumer files analyzed and catalogued
- [ ] Pattern IDs assigned following `CSM-XX-XX` convention
- [ ] Acknowledgment mode and timing documented
- [ ] Idempotency strategy documented with key source and store
- [ ] DLQ/DLT configuration and retry policy documented
- [ ] Deserialization patterns documented
- [ ] Good/bad examples provided for major patterns
- [ ] Source references include class index identifiers
- [ ] Security section completed (poison pill, schema validation, access control)
- [ ] Embedded broker / Testcontainers testing approach described
- [ ] Performance (throughput, back-pressure) addressed
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines
