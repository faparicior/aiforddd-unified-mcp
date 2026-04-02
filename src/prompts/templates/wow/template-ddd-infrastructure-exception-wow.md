# 🎯 DDD Infrastructure Layer - {{PackageName}} Package Infrastructure Exceptions (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

> This document defines the Infrastructure Exception patterns and guidelines for the `{{PackageName}}` package following DDD architectural principles.
>
> **Related templates**: `template-ddd-domain-exception-wow.md` (Domain Exceptions) | `template-ddd-repository-wow.md` (Repositories)

---

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#️-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
4. [🗂️ Exception Hierarchy](#️-exception-hierarchy)
5. [📐 Exception Patterns](#-exception-patterns)
6. [🛠️ Implementation Guidelines](#️-implementation-guidelines)
7. [🔁 Retry Semantics & Circuit Breaker](#-retry-semantics--circuit-breaker)
8. [🗺️ Domain Exception Mapping](#️-domain-exception-mapping)
9. [🧪 Testing Approach](#-testing-approach)
10. [🚫 Anti-Patterns to Avoid](#-anti-patterns-to-avoid)
11. [Summary](#summary)
12. [Pattern Index](#pattern-index)
13. [❓ Open Questions](#-open-questions)

---

## 📌 Overview

**Package:** `{{PackageName}}`  
**Description:** {{PackageDescription}}  
**Responsibility:** {{PrimaryResponsibility}}

**Domain Purpose:** {{DomainPurpose}}

**Architecture Layer:** Infrastructure Layer - {{SpecificInfrastructureLayer}}

---

## 🏗️ Architecture Position

```
Infrastructure Layer ({{PackageName}}) → Infrastructure Exceptions → Application/Domain boundary (translation to domain exceptions)
```

The `{{PackageName}}` infrastructure exceptions wrap technical failures from external dependencies, {{ArchitectureDescription}} providing a typed, retryability-aware exception hierarchy while keeping domain-level exception hierarchies free of infrastructure concerns.

---

## 📋 Architecture Rules

### 1. Layer Responsibility
- **Purpose**: {{LayerMainPurpose}}
- **Dependencies**: {{AllowedDependencies}}
- **Restrictions**: {{LayerRestrictions}}

### 2. Package Structure Convention
{{PackageNamingPattern}}

Examples:
- {{PackageExample1}}
- {{PackageExample2}}
- {{PackageExample3}}

---

## 🗂️ Exception Hierarchy

### Base Classes

| Base Class | Retryable | Description |
|-----------|-----------|-------------|
| {{BaseClass1}} | {{Retryable1}} | {{BaseClass1Description}} |
| {{BaseClass2}} | {{Retryable2}} | {{BaseClass2Description}} |

### Hierarchy Diagram

```
{{ExceptionHierarchyDiagram}}
```

### Retryable vs Non-Retryable Decision Rules

{{RetryableDecisionRules}}

---

## 📐 Exception Patterns

### Exception Hierarchy Patterns

#### {{HierarchyCategoryName}}

{{#HierarchyPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**✅ GOOD - {{PatternDescription}}:**

```
{{GoodPatternExample}}
```
**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**Key Benefits:**
{{#Benefits}}
- **{{BenefitName}}**: {{BenefitDescription}}
{{/Benefits}}

**❌ BAD - {{AntiPatternDescription}}:**
```
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}
- {{Reason}}
{{/AntiPatternReasons}}

{{/HierarchyPatternRules}}

---

### Constructor & Wrapping Patterns

#### {{ConstructionCategoryName}}

{{#ConstructionPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**✅ GOOD - {{PatternDescription}}:**

```
{{GoodPatternExample}}
```
**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**Key Benefits:**
{{#Benefits}}
- **{{BenefitName}}**: {{BenefitDescription}}
{{/Benefits}}

**❌ BAD - {{AntiPatternDescription}}:**
```
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}
- {{Reason}}
{{/AntiPatternReasons}}

{{/ConstructionPatternRules}}

---

### External Error Translation Patterns

#### {{TranslationCategoryName}}

{{#TranslationPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**✅ GOOD - {{PatternDescription}}:**

```
{{GoodPatternExample}}
```
**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**Key Benefits:**
{{#Benefits}}
- **{{BenefitName}}**: {{BenefitDescription}}
{{/Benefits}}

**❌ BAD - {{AntiPatternDescription}}:**
```
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}
- {{Reason}}
{{/AntiPatternReasons}}

{{/TranslationPatternRules}}

---

## 🛠️ Implementation Guidelines

### Naming Convention
{{NamingConventionDescription}}

### Constructor Signatures
{{ConstructorSignatureGuidelines}}

### Contextual Data
{{ContextualDataGuidelines}} (endpoint URL, operation name, resource ID, HTTP status code)

### Where to Throw
{{WhereToThrowGuidelines}} (adapter methods, client wrappers, never in domain/application layer directly)

---

## 🔁 Retry Semantics & Circuit Breaker

### Retryability Classification

| Exception | Retryable | Reason |
|-----------|-----------|--------|
| {{Exception1}} | {{Retryable1}} | {{RetryableReason1}} |
| {{Exception2}} | {{Retryable2}} | {{RetryableReason2}} |
| {{Exception3}} | {{Retryable3}} | {{RetryableReason3}} |

### Retry Integration
- **Retry Framework**: {{RetryFramework}} (e.g., Resilience4j, Spring @Retryable, manual)
- **Retry Detection**: {{RetryDetectionMechanism}} (base class check, annotation, flag)
- **Circuit Breaker**: {{CircuitBreakerIntegration}}
- **Backoff Strategy**: {{BackoffStrategy}}

**Example:**
```
{{RetryExample}}
```

---

## 🗺️ Domain Exception Mapping

### At Adapter Boundaries

| Infrastructure Exception | Mapped To | Notes |
|--------------------------|-----------|-------|
| {{InfraException1}} | {{DomainException1}} | {{MappingNotes1}} |
| {{InfraException2}} | {{DomainException2}} | {{MappingNotes2}} |

### Mapping Strategy
{{MappingStrategyDescription}}

### Layering Rule
{{LayeringRule}} (Domain layer must never catch infrastructure exceptions directly; adapters translate at the boundary)

**Example:**
```
{{MappingExample}}
```

---

## 🧪 Testing Approach

### Unit Testing
- **{{UnitTestPattern}}**: {{UnitTestDescription}}
- **Mock Strategy**: {{MockStrategy}}
- **Coverage Target**: {{CoverageTarget}}

### Exception Testing Rules

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
**Total Infrastructure Exceptions Analyzed**: {{TotalExceptionCount}}
{{#CoverageByCategory}}
- **{{CategoryName}}**: {{ExceptionCount}} exceptions ({{CoveragePercentage}}% coverage)
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

## Template Variables Reference

### Exception Hierarchy Variables
- `{{BaseClass1}}` / `{{BaseClass2}}` - Base infrastructure exception class names
- `{{Retryable1}}` / `{{Retryable2}}` - "Yes" or "No"
- `{{ExceptionHierarchyDiagram}}` - ASCII tree of exception class hierarchy
- `{{RetryableDecisionRules}}` - Rules for deciding retryable vs non-retryable

### Pattern Definition Variables
- `{{PatternId}}` - Unique pattern identifier (e.g., "IEXC-HIR-01", "IEXC-CTR-01")
- `{{PatternName}}` - Descriptive name of the pattern
- `{{ClassIndexIdentifier}}` - Hash identifier from class index
- `{{FileName}}` - Source file name

### Retry Semantics Variables
- `{{RetryFramework}}` - Name of the retry/resilience framework
- `{{RetryDetectionMechanism}}` - How retryability is detected at runtime
- `{{CircuitBreakerIntegration}}` - Circuit breaker integration approach
- `{{BackoffStrategy}}` - Backoff algorithm (exponential, fixed, jitter)

### Domain Mapping Variables
- `{{MappingStrategyDescription}}` - How infrastructure exceptions are translated at adapter boundaries
- `{{LayeringRule}}` - The rule prohibiting domain layer from catching infrastructure exceptions

### Coverage Summary Variables
- `{{TotalExceptionCount}}` - Total number of infrastructure exceptions analyzed
- `{{CoverageByCategory}}` - Array of coverage objects

## Usage Instructions

### 1. Exception Hierarchy Analysis
Map the complete hierarchy:
- Identify all base/abstract infrastructure exception classes
- Classify each leaf exception as retryable or non-retryable
- Document what external failure condition each exception represents

### 2. Pattern ID Format
- `IEXC-HIR-XX`: Exception hierarchy and base class patterns
- `IEXC-CTR-XX`: Constructor and error wrapping patterns
- `IEXC-EXT-XX`: External error translation patterns at adapter boundary
- `IEXC-RTY-XX`: Retry semantics and circuit-breaker integration patterns
- `IEXC-MAP-XX`: Domain exception mapping at port boundary patterns

### 3. Boundary Mapping Tables
Always document how infrastructure exceptions are translated at:
- Adapter layer (infrastructure exception → domain exception or rethrow)
- Use case layer (should NOT catch infrastructure exceptions directly)

### 4. Template Completion Checklist

- [ ] All infrastructure exception files analyzed and catalogued
- [ ] Exception hierarchy diagram completed
- [ ] Retryable vs. non-retryable distinction documented
- [ ] Retry framework integration documented
- [ ] Domain exception mapping table completed
- [ ] Pattern IDs assigned following naming convention
- [ ] Good/bad examples provided for major patterns
- [ ] Testing approaches specified
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines
