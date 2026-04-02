# 🎯 DDD Domain Layer - {{PackageName}} Package Domain Exceptions (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#️-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
4. [🗂️ Exception Hierarchy](#️-exception-hierarchy)
5. [📐 Exception Patterns](#-exception-patterns)
6. [🛠️ Implementation Guidelines](#️-implementation-guidelines)
7. [🗺️ Exception-to-Response Mapping](#️-exception-to-response-mapping)
8. [🧪 Testing Approach](#-testing-approach)
9. [🚫 Anti-Patterns to Avoid](#-anti-patterns-to-avoid)
10. [Summary](#summary)
11. [Pattern Index](#pattern-index)
12. [❓ Open Questions](#-open-questions)

## 📌 Overview

**Package:** `{{PackageName}}`
**Description:** {{PackageDescription}}
**Responsibility:** {{PrimaryResponsibility}}

**Domain Purpose:** {{DomainPurpose}}

**Architecture Layer:** Domain Layer - {{SpecificDomainLayer}}

## 🏗️ Architecture Position

```
Domain Layer ({{PackageName}}) → Domain Exceptions → Infrastructure / Application Layer (boundary translation)
```

The `{{PackageName}}` domain exceptions encode domain rule violations in a language the domain understands, {{ArchitectureDescription}} while keeping infrastructure concerns (HTTP status codes, retry decisions) out of the domain.

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

### Exception Construction Patterns

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

### Exception Semantics Patterns

#### {{SemanticsCategoryName}}

{{#SemanticsPatternRules}}
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

{{/SemanticsPatternRules}}

---

## 🛠️ Implementation Guidelines

### Naming Convention
{{NamingConventionDescription}}

### Constructor Signatures
{{ConstructorSignatureGuidelines}}

### Contextual Data
{{ContextualDataGuidelines}}

### Where to Throw
{{WhereToThrowGuidelines}}

---

## 🗺️ Exception-to-Response Mapping

### At Controller Boundaries

| Exception | HTTP Status | Notes |
|-----------|------------|-------|
| {{Exception1}} | {{HttpStatus1}} | {{Notes1}} |
| {{Exception2}} | {{HttpStatus2}} | {{Notes2}} |

### At Consumer Boundaries

| Exception | Consumer Action | Notes |
|-----------|----------------|-------|
| {{Exception1}} | {{ConsumerAction1}} | {{Notes1}} |
| {{Exception2}} | {{ConsumerAction2}} | {{Notes2}} |

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
**Total Domain Exceptions Analyzed**: {{TotalExceptionCount}}
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
- `{{BaseClass1}}` / `{{BaseClass2}}` - Base exception class names (e.g., "NonRetryableDomainException", "RetryableDomainException")
- `{{Retryable1}}` / `{{Retryable2}}` - "Yes" or "No"
- `{{ExceptionHierarchyDiagram}}` - ASCII tree of exception class hierarchy
- `{{RetryableDecisionRules}}` - Rules for deciding retryable vs non-retryable

### Pattern Definition Variables
- `{{PatternId}}` - Unique pattern identifier (e.g., "EXC-HIR-01", "EXC-CTR-01")
- `{{PatternName}}` - Descriptive name of the pattern
- `{{ClassIndexIdentifier}}` - Hash identifier from class index
- `{{FileName}}` - Source file name

### Coverage Summary Variables
- `{{TotalExceptionCount}}` - Total number of domain exceptions analyzed
- `{{CategoryName}}` - Category name for coverage summary
- `{{ExceptionCount}}` - Number of exceptions in category
- `{{CoveragePercentage}}` - Percentage coverage for category

## Usage Instructions

### 1. Exception Hierarchy Analysis
Map the complete hierarchy:
- Identify all base/abstract exception classes
- Classify each leaf exception as retryable or non-retryable
- Document what domain rule violation each exception represents

### 2. Pattern ID Format
- `EXC-HIR-XX`: Exception hierarchy and base class patterns
- `EXC-CTR-XX`: Exception construction and factory patterns
- `EXC-SEM-XX`: Exception semantics and domain language patterns
- `EXC-USG-XX`: Exception usage and propagation patterns
- `EXC-MAP-XX`: Exception-to-response mapping patterns

### 3. Boundary Mapping Tables
Always document how exceptions are translated at:
- Controller layer (exception → HTTP status)
- Consumer layer (exception → retry / reject / DLQ)

### 4. Template Completion Checklist

- [ ] All exception files analyzed and catalogued
- [ ] Exception hierarchy diagram completed
- [ ] Retryable vs non-retryable distinction documented
- [ ] Pattern IDs assigned following naming convention
- [ ] Good/bad examples provided for major patterns
- [ ] Boundary mapping tables completed
- [ ] Testing approaches specified
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines
