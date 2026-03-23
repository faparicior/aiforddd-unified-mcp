# 🎯 DDD UI Layer - Schedulers & Batch Processors - {{PackageName}} Package (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

> This document defines the Scheduler and Batch Processor patterns and guidelines for the `{{PackageName}}` package following DDD architectural principles.
>
> **Related templates**: `template-ddd-controller-wow.md` (Controllers) | `template-ddd-event-consumer-wow.md`

---

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#-architecture-position)
3. [📐 Core Patterns and Rules](#-core-patterns-and-rules)
4. [⏰ Trigger & Cron Configuration](#-trigger--cron-configuration)
5. [🔐 Concurrency Lock Strategy](#-concurrency-lock-strategy)
6. [♻️ Partial Failure & Recovery Strategy](#-partial-failure--recovery-strategy)
7. [📊 Progress Tracking](#-progress-tracking)
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

**Architecture Layer:** UI Layer - Schedulers & Batch Processors

---

## 🏗️ Architecture Position

```
Scheduler/Cron Trigger → Scheduler Component ({{PackageName}}) → Application Layer ({{ApplicationComponents}}) → Domain Layer
```

The `{{PackageName}}` schedulers are triggered by time-based or event-based triggers and delegate batch operations to the application layer, managing concurrency control and partial failure recovery.

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

## ⏰ Trigger & Cron Configuration

### Trigger Strategy
- **Trigger Type**: {{TriggerType}} (e.g., cron expression, fixed-rate, fixed-delay, event-driven)
- **Schedule Expression**: {{ScheduleExpression}} (e.g., `0 0 * * *`, `@daily`)
- **Timezone Handling**: {{TimezoneHandling}}
- **Conditional Execution**: {{ConditionalExecutionStrategy}} (e.g., feature flag, environment guard)

### Cron Configuration Rules
- **{{CronRule1}}**: {{CronRuleDescription1}}
- **{{CronRule2}}**: {{CronRuleDescription2}}

**Example:**
```kotlin
{{TriggerConfigExample}}
```

---

## 🔐 Concurrency Lock Strategy

### Distributed Lock Approach
- **Lock Mechanism**: {{LockMechanism}} (e.g., Redis SETNX, DB advisory lock, Zookeeper)
- **Lock Key**: {{LockKeyStrategy}}
- **Lock TTL**: {{LockTtl}}
- **Lock Acquisition Failure**: {{LockAcquisitionFailureBehavior}} (e.g., skip, log, alert)
- **Lock Release**: {{LockReleaseStrategy}} (e.g., finally block, TTL expiry)

{{#LockPatternRules}}
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

{{/LockPatternRules}}

---

## ♻️ Partial Failure & Recovery Strategy

### Batch Processing Approach
- **Chunk Size**: {{ChunkSize}}
- **Failure Isolation**: {{FailureIsolationStrategy}} (e.g., per-item, per-chunk, abort all)
- **Retry Behavior**: {{RetryBehavior}}
- **Resumability**: {{ResumabilityStrategy}} (e.g., cursor-based, offset tracking)

### Recovery Patterns
- **{{RecoveryPattern1}}**: {{RecoveryDescription1}}
- **{{RecoveryPattern2}}**: {{RecoveryDescription2}}

**Example:**
```kotlin
{{PartialFailureExample}}
```

---

## 📊 Progress Tracking

### Tracking Strategy
- **Tracking Mechanism**: {{TrackingMechanism}} (e.g., DB table, metrics, logs)
- **Metrics Emitted**: {{MetricsEmitted}} (e.g., processed count, failed count, duration)
- **Alerting Thresholds**: {{AlertingThresholds}}

---

## 🛠️ Implementation Guidelines

### Dependency Injection
- **{{DIPattern}}**: {{DIDescription}}
- **Configuration**: {{ConfigurationApproach}}
- **Lifecycle**: {{LifecycleManagement}}

### Environment Guards
- **{{EnvironmentGuardPattern}}**: {{EnvironmentGuardDescription}}
- **Disable in Test**: {{DisableInTestStrategy}}

{{#ImplementationGuidelines}}
### {{GuidelineName}}
{{GuidelineDescription}}

{{/ImplementationGuidelines}}

---

## ⚠️ Error Handling Strategy

### Per-Item Error Handling
{{PerItemErrorStrategy}}

**Example:**
```kotlin
{{PerItemErrorExample}}
```

### Batch-Level Error Handling
{{BatchLevelErrorStrategy}}

### {{ErrorLoggingPattern}}
{{ErrorLoggingDescription}}

---

## 🧪 Testing Approach

### Unit Testing
- **{{UnitTestPattern}}**: {{UnitTestDescription}}
- **Mock Strategy**: {{MockStrategy}}
- **Coverage Target**: {{CoverageTarget}}

### Integration Testing (Time Manipulation / Trigger Mocks)
- **{{IntegrationTestPattern}}**: {{IntegrationTestDescription}}
- **Test Environment**: {{TestEnvironment}}
- **Clock/Time Mocking**: {{ClockMockingStrategy}}

### Scheduler Testing Rules

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

### Chunk & Parallelism Strategy
- **{{ChunkStrategy}}**: {{ChunkStrategyDescription}}

### Resource Impact
- **{{ResourcePattern}}**: {{ResourcePatternDescription}}

{{#PerformancePatterns}}
### {{PerformancePatternName}}
{{PerformancePatternDescription}}

{{/PerformancePatterns}}

---

## 🔒 Security Guidelines

### Resource Exhaustion Prevention
- **{{ResourceExhaustionPattern}}**: {{ResourceExhaustionDescription}}
- **Max Execution Time**: {{MaxExecutionTimeGuard}}

### Distributed Lock Security
- **{{LockSecurityPattern}}**: {{LockSecurityDescription}}

### Sensitive Data in Batch Operations
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
**Total UI Layer Schedulers Analyzed**: {{TotalInterfaceCount}}
{{#CoverageByCategory}}
- **{{CategoryName}}**: {{InterfaceCount}} schedulers ({{CoveragePercentage}}% coverage)
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
- `{{LockPatternRules}}` - Array of concurrency lock pattern rules
- `{{PatternCategories}}` - Array of pattern category objects with nested patterns
- `{{PatternId}}` - Unique pattern identifier (e.g., "SCH-TRG-01", "SCH-LCK-01")
- `{{PatternName}}` - Descriptive name of the pattern
- `{{ClassIndexIdentifier}}` - Hash identifier from class index (e.g., "a1b2c3d4e5f6")
- `{{FileName}}` - Source file name (e.g., "ProcessExpiredOrdersBatch.kt")
- `{{Benefits}}` - Array of benefit objects with BenefitName and BenefitDescription
- `{{AntiPatternReasons}}` - Array of reason strings for anti-pattern explanations
- `{{SourceFiles}}` - Array of source file objects with ClassIndexIdentifier and FileName

### Scheduler-Specific Variables
- `{{TriggerType}}` - Type of trigger (cron, fixed-rate, etc.)
- `{{ScheduleExpression}}` - Actual cron or rate expression
- `{{LockMechanism}}` - Distributed lock technology
- `{{LockTtl}}` - Lock time-to-live value
- `{{ChunkSize}}` - Batch chunk size
- `{{FailureIsolationStrategy}}` - How failures are isolated within a batch

### Coverage Summary Variables
- `{{TotalInterfaceCount}}` - Total number of schedulers analyzed
- `{{CoverageByCategory}}` - Array of coverage objects with CategoryName, InterfaceCount, and CoveragePercentage

### File Analysis Variables
- `{{AnalyzedFiles}}` - List of all files that were analyzed
- `{{ClassIndexIdentifier}}` - Unique hash for file identification
- `{{FileName}}` - Name of the analyzed file

## Usage Instructions

### 1. Pattern Identification
For each scheduler pattern found in your analysis:
1. Assign a unique pattern ID following the format: `SCH-{{CategoryPrefix}}-{{Number}}`
   - `SCH-TRG-XX`: Trigger and cron configuration patterns
   - `SCH-LCK-XX`: Distributed lock and concurrency patterns
   - `SCH-ERR-XX`: Error handling and recovery patterns
   - `SCH-PRG-XX`: Progress tracking and observability patterns
   - `SCH-CHK-XX`: Chunking and batch partitioning patterns

2. Create descriptive pattern names that capture the architectural intent
3. Reference the source file using the class index identifier

### 2. What to Analyze
- **Trigger Configuration**: Cron expressions, fixed rates, conditional execution guards
- **Concurrency Safety**: Distributed lock presence and TTL configuration
- **Application Layer Delegation**: How schedulers delegate to use cases
- **Partial Failure Handling**: Per-item vs. per-chunk failure isolation
- **Resumability**: Whether the scheduler can resume from a checkpoint after failure
- **Progress Tracking**: What metrics and logs are emitted

### 3. Pattern Naming Conventions

#### Good Pattern Names
- ✅ **Distributed Lock Guard Pattern** - Describes concurrency safety
- ✅ **Cursor-Based Resumable Batch Pattern** - Describes resumability
- ✅ **Per-Item Failure Isolation Pattern** - Describes fault tolerance
- ✅ **Environment-Guarded Trigger Pattern** - Describes conditional execution

#### Bad Pattern Names
- ❌ **Spring Scheduler Pattern** - Too technology-specific
- ❌ **Cron Pattern** - Too generic
- ❌ **Job Pattern** - Vague

### 4. Scheduler Analysis Guidelines

#### What to Look For
- **Concurrency Lock Required**: Any scheduler that must not run concurrently must have a distributed lock
- **Environment Guard**: Schedulers in multi-instance environments must guard against unintended execution
- **Thin Scheduler Rule**: Schedulers should only trigger and delegate — no business logic
- **Chunk Processing**: Large datasets must be processed in chunks to prevent memory/timeout issues

#### Anti-Patterns to Identify
- **Missing Distributed Lock**: Multiple instances run the same job simultaneously
- **Business Logic in Scheduler**: Domain rules embedded in the scheduled method
- **No Partial Failure Handling**: One failed item aborts the entire batch
- **Unguarded Production Cron**: Scheduler runs in dev/test environments unintentionally
- **No Progress Tracking**: Silent batch execution with no observability

### 5. Template Completion Checklist

- [ ] All scheduler files analyzed and catalogued
- [ ] Pattern IDs assigned following `SCH-XX-XX` convention
- [ ] Trigger type and cron expression patterns documented
- [ ] Distributed lock mechanism and TTL documented
- [ ] Partial failure and recovery strategy documented
- [ ] Progress tracking and metrics documented
- [ ] Good/bad examples provided for major patterns
- [ ] Source references include class index identifiers
- [ ] Security section completed (resource exhaustion, lock security)
- [ ] Time manipulation / trigger mock testing approach described
- [ ] Performance (chunk size, parallelism) addressed
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines
