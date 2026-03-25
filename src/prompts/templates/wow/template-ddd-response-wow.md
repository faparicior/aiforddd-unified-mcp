# 🎯 DDD Response Layer - {{PackageName}} Package Response DTOs (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

> This document defines Response DTO patterns for the `{{PackageName}}` package, covering both Application Layer responses (returned to the UI layer) and User Interface Layer responses (returned to external clients).
>
> **Related templates**: `template-ddd-controller-wow.md` | `template-ddd-use-case-wow.md`

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#️-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
4. [🔁 Domain-to-Response Mapping Patterns](#-domain-to-response-mapping-patterns)
5. [🏗 Response Structure Patterns](#-response-structure-patterns)
6. [🔤 Serialization Patterns](#-serialization-patterns)
7. [🎭 Layer-Specific Response Patterns](#-layer-specific-response-patterns)
8. [🧮 Derived Field Patterns](#-derived-field-patterns)
9. [🛠️ Implementation Guidelines](#️-implementation-guidelines)
10. [🧪 Testing Approach](#-testing-approach)
11. [🚫 Anti-Patterns to Avoid](#-anti-patterns-to-avoid)
12. [Summary](#summary)
13. [Pattern Index](#pattern-index)
14. [❓ Open Questions](#-open-questions)

## 📌 Overview

**Package:** `{{PackageName}}`
**Description:** {{PackageDescription}}
**Responsibility:** {{PrimaryResponsibility}}

**Domain Purpose:** {{DomainPurpose}}

**Architecture Layers Covered:**
- Application Layer Responses → returned from use cases to the UI layer
- User Interface Layer Responses → returned from controllers to external clients

## 🏗️ Architecture Position

```
Domain Layer → Application Layer (Response DTOs) → UI Layer (Response DTOs) → External Clients
```

The `{{PackageName}}` response DTOs form the outbound data contract, {{ArchitectureDescription}} translating domain models into shapes optimized for external consumption.

---

## 📋 Architecture Rules

### 1. Layer Responsibility
- **Purpose**: {{LayerMainPurpose}}
- **Dependencies**: {{AllowedDependencies}}
- **Restrictions**: {{LayerRestrictions}}

### 2. Response DTO Layers

| Layer | Scope | Consumer |
|-------|-------|----------|
| Application Layer Response | Internal use case output | UI Layer controllers |
| UI Layer Response | External HTTP output | REST clients / frontends |

### 3. Package Structure Convention
{{PackageNamingPattern}}

Examples:
- {{PackageExample1}}
- {{PackageExample2}}
- {{PackageExample3}}

---

## 🔁 Domain-to-Response Mapping Patterns

### Mapping rules by Category

#### {{MappingCategoryName}}

{{#MappingPatternRules}}
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

{{/MappingPatternRules}}

---

## 🏗 Response Structure Patterns

### Structure rules by Category

#### {{StructureCategoryName}}

{{#StructurePatternRules}}
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

{{/StructurePatternRules}}

---

## 🔤 Serialization Patterns

### Serialization rules by Category

#### {{SerializationCategoryName}}

{{#SerializationPatternRules}}
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

{{/SerializationPatternRules}}

---

## 🎭 Layer-Specific Response Patterns

### Layer-Specific rules by Category

#### {{LayerCategoryName}}

{{#LayerPatternRules}}
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

{{/LayerPatternRules}}

---

## 🧮 Derived Field Patterns

### Derived Field rules by Category

#### {{DerivedCategoryName}}

{{#DerivedPatternRules}}
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

{{/DerivedPatternRules}}

---

## 🛠️ Implementation Guidelines

### Mapping Strategy
{{MappingStrategyDescription}}

### Nullability and Optional Fields
{{NullabilityDescription}}

### Serialization Approach
{{SerializationApproachDescription}}

### Application vs UI Layer Distinction
{{LayerDistinctionGuidelines}}

---

## 🧪 Testing Approach

### Unit Testing
- **{{UnitTestPattern}}**: {{UnitTestDescription}}
- **Mock Strategy**: {{MockStrategy}}
- **Coverage Target**: {{CoverageTarget}}

### Response Testing Rules

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
**Total Response DTOs Analyzed**: {{TotalResponseCount}}
{{#CoverageByCategory}}
- **{{CategoryName}}**: {{ResponseCount}} DTOs ({{CoveragePercentage}}% coverage)
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

## Template Variables Reference

### Pattern Definition Variables
- `{{PatternId}}` - Unique pattern identifier (e.g., "RSP-MAP-01", "RSP-STR-01")
- `{{PatternName}}` - Descriptive name of the pattern
- `{{ClassIndexIdentifier}}` - Hash identifier from class index
- `{{FileName}}` - Source file name

### Coverage Summary Variables
- `{{TotalResponseCount}}` - Total number of response DTOs analyzed
- `{{CategoryName}}` - Category name for coverage summary
- `{{ResponseCount}}` - Number of DTOs in category
- `{{CoveragePercentage}}` - Percentage coverage for category

## Usage Instructions

### 1. Pattern ID Format
- `RSP-MAP-XX`: Domain-to-response mapping patterns
- `RSP-STR-XX`: Response structure patterns
- `RSP-SER-XX`: Serialization annotation patterns
- `RSP-LYR-XX`: Layer-specific response patterns
- `RSP-DRV-XX`: Derived and computed field patterns

### 2. Key Analysis Points
- **Mapping**: Does the response use a static factory method (fromDomain(), of())?
- **Layers**: Are Application Layer and UI Layer responses clearly separated?
- **Serialization**: What Jackson annotations are used? How are nulls handled?
- **Derived fields**: Are any fields computed from multiple domain values?
- **Flattening**: How are nested domain value objects flattened to primitives?

### 3. Template Completion Checklist

- [ ] All response DTO files analyzed and catalogued
- [ ] Application Layer vs UI Layer responses distinguished
- [ ] Mapping strategy documented
- [ ] Pattern IDs assigned following naming convention
- [ ] Good/bad examples provided for major patterns
- [ ] Serialization approach documented
- [ ] Derived field patterns documented
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines
