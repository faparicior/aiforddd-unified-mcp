# 🎯 DDD Infrastructure Layer - {{PackageName}} Package Integration Services (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

> This document defines Integration Service patterns for the `{{PackageName}}` package — RowMappers, result transformers, metrics services, event processing wrappers, and supporting infrastructure components.
>
> **Related templates**: `template-ddd-repository-wow.md` | `template-ddd-event-consumer-wow.md` | `template-ddd-configuration-wow.md`

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#️-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
4. [🗺️ Result Mapper / RowMapper Patterns](#️-result-mapper--rowmapper-patterns)
5. [🔄 Data Transformation Patterns](#-data-transformation-patterns)
6. [📊 Metrics & Observability Patterns](#-metrics--observability-patterns)
7. [⚙️ Event Processing Support Patterns](#️-event-processing-support-patterns)
8. [🔧 Utility & Extension Patterns](#-utility--extension-patterns)
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

**Architecture Layer:** Infrastructure Layer - Integration Services

## 🏗️ Architecture Position

```
Infrastructure Mechanisms (JDBC, Kafka, Micrometer) → Integration Services ({{PackageName}}) → Domain/Application Layer
```

The `{{PackageName}}` integration services provide the glue between raw infrastructure mechanisms and the domain model, {{ArchitectureDescription}} preventing infrastructure concerns from leaking into domain or application layers.

---

## 📋 Architecture Rules

### 1. Layer Responsibility
- **Purpose**: {{LayerMainPurpose}}
- **Dependencies**: {{AllowedDependencies}}
- **Restrictions**: {{LayerRestrictions}}

### 2. Integration Service Types

| Type | Description |
|------|-------------|
| {{ServiceType1}} | {{ServiceType1Description}} |
| {{ServiceType2}} | {{ServiceType2Description}} |
| {{ServiceType3}} | {{ServiceType3Description}} |

### 3. Package Structure Convention
{{PackageNamingPattern}}

---

## 🗺️ Result Mapper / RowMapper Patterns

### RowMapper rules by Category

#### {{RowMapperCategoryName}}

{{#RowMapperPatternRules}}
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

{{/RowMapperPatternRules}}

---

## 🔄 Data Transformation Patterns

### Data Transformation rules by Category

#### {{TransformationCategoryName}}

{{#TransformationPatternRules}}
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

{{/TransformationPatternRules}}

---

## 📊 Metrics & Observability Patterns

### Metrics rules by Category

#### {{MetricsCategoryName}}

{{#MetricsPatternRules}}
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

{{/MetricsPatternRules}}

### Metrics Namespace & Tagging Strategy

| Metric Name | Tags | Description |
|-------------|------|-------------|
| {{MetricName1}} | {{MetricTags1}} | {{MetricDescription1}} |
| {{MetricName2}} | {{MetricTags2}} | {{MetricDescription2}} |

---

## ⚙️ Event Processing Support Patterns

### Event Processing rules by Category

#### {{EventProcessingCategoryName}}

{{#EventProcessingPatternRules}}
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

{{/EventProcessingPatternRules}}

---

## 🔧 Utility & Extension Patterns

### Utility rules by Category

#### {{UtilityCategoryName}}

{{#UtilityPatternRules}}
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

{{/UtilityPatternRules}}

---

## 🛠️ Implementation Guidelines

### RowMapper Design
{{RowMapperDesignDescription}}

### Metrics Namespace Convention
{{MetricsNamespaceConvention}}

### Event Processing Wrapper Contract
{{EventProcessingWrapperDescription}}

### Extension Function Guidelines
{{ExtensionFunctionGuidelines}}

---

## 🧪 Testing Approach

### Unit Testing
- **{{UnitTestPattern}}**: {{UnitTestDescription}}
- **Mock Strategy**: {{MockStrategy}}
- **Coverage Target**: {{CoverageTarget}}

### Integration Service Testing Rules

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
**Total Integration Service Classes Analyzed**: {{TotalServiceCount}}
{{#CoverageByCategory}}
- **{{CategoryName}}**: {{ServiceCount}} classes ({{CoveragePercentage}}% coverage)
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

### Integration Service Variables
- `{{ServiceType1}}` / `{{ServiceType1Description}}` - Type of integration service and its role
- `{{MetricName1}}` / `{{MetricTags1}}` / `{{MetricDescription1}}` - Metrics table entries

### Pattern Definition Variables
- `{{PatternId}}` - Unique pattern identifier (e.g., "SVC-MAP-01", "SVC-MET-01")
- `{{PatternName}}` - Descriptive name of the pattern
- `{{ClassIndexIdentifier}}` - Hash identifier from class index
- `{{FileName}}` - Source file name

### Coverage Summary Variables
- `{{TotalServiceCount}}` - Total number of integration service classes analyzed
- `{{CategoryName}}` - Category name for coverage summary
- `{{ServiceCount}}` - Number of classes in category
- `{{CoveragePercentage}}` - Percentage coverage for category

## Usage Instructions

### 1. Pattern ID Format
- `SVC-MAP-XX`: Result mapper and RowMapper patterns
- `SVC-TRN-XX`: Data transformation and aggregation patterns
- `SVC-MET-XX`: Metrics and observability patterns
- `SVC-EVT-XX`: Event processing support patterns
- `SVC-UTL-XX`: Utility and extension function patterns

### 2. Key Analysis Points
- **RowMappers**: How do they translate ResultSet columns to domain objects? Null safety? Date handling?
- **Transformers**: Do they aggregate data (groupBy, pre-computed maps)? What domain objects do they produce?
- **Metrics**: What is the namespace? What tags are applied? What lifecycle stages are tracked?
- **Event wrappers**: How do they classify exceptions (retryable vs non-retryable)? How do they record metrics?
- **Extensions**: What Kotlin extension functions exist? On what types? What validation do they perform?

### 3. Template Completion Checklist

- [ ] All integration service files analyzed and catalogued
- [ ] RowMapper patterns documented
- [ ] Transformation patterns documented
- [ ] Metrics namespace and tagging strategy documented in table
- [ ] Event processing wrapper patterns documented
- [ ] Extension function patterns documented
- [ ] Pattern IDs assigned following naming convention
- [ ] Good/bad examples provided for major patterns
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines
