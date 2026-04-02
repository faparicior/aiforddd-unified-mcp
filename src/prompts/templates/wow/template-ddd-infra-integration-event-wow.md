# 🎯 DDD Infrastructure Layer - {{PackageName}} Package Integration Events (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

> This document defines Integration Event DTO patterns for the `{{PackageName}}` package. Integration events cross system or bounded context boundaries and are designed for serialization.
>
> **Related templates**: `template-ddd-event-consumer-wow.md` | `template-ddd-event-producer-wow.md`

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#️-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
4. [✉️ Event Envelope Patterns](#️-event-envelope-patterns)
5. [📦 Payload Patterns](#-payload-patterns)
6. [🪆 Nested Object Patterns](#-nested-object-patterns)
7. [🔤 Deserialization Annotation Patterns](#-deserialization-annotation-patterns)
8. [🔀 Domain Mapping Patterns](#-domain-mapping-patterns)
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

**Architecture Layer:** Infrastructure Layer - Integration Events
**Serialization Technology:** `{{SerializationTechnology}}`

## 🏗️ Architecture Position

```
External System → Integration Event DTOs ({{PackageName}}) → Event Consumers → Domain/Application Layer
```

The `{{PackageName}}` integration events form the anti-corruption boundary between external event schemas and the domain model, {{ArchitectureDescription}}.

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

## ✉️ Event Envelope Patterns

### Envelope rules by Category

#### {{EnvelopeCategoryName}}

{{#EnvelopePatternRules}}
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

{{/EnvelopePatternRules}}

---

## 📦 Payload Patterns

### Payload rules by Category

#### {{PayloadCategoryName}}

{{#PayloadPatternRules}}
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

{{/PayloadPatternRules}}

---

## 🪆 Nested Object Patterns

### Nested Object rules by Category

#### {{NestedCategoryName}}

{{#NestedPatternRules}}
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

{{/NestedPatternRules}}

---

## 🔤 Deserialization Annotation Patterns

### Deserialization rules by Category

#### {{DeserializationCategoryName}}

{{#DeserializationPatternRules}}
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

{{/DeserializationPatternRules}}

---

## 🔀 Domain Mapping Patterns

### Domain Mapping rules by Category

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

## 🛠️ Implementation Guidelines

### Event Envelope Structure
{{EnvelopeStructureDescription}}

### Field Naming Conventions
{{FieldNamingConventions}}

### Nullability Strategy
{{NullabilityStrategy}}

### Version Tolerance
{{VersionToleranceDescription}}

### Co-location vs. Separate Files
{{FileOrganizationGuidelines}}

---

## 🧪 Testing Approach

### Unit Testing
- **{{UnitTestPattern}}**: {{UnitTestDescription}}
- **Mock Strategy**: {{MockStrategy}}
- **Coverage Target**: {{CoverageTarget}}

### Integration Event Testing Rules

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
**Total Integration Event Classes Analyzed**: {{TotalEventCount}}
{{#CoverageByCategory}}
- **{{CategoryName}}**: {{EventCount}} classes ({{CoveragePercentage}}% coverage)
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

### Integration Event Variables
- `{{SerializationTechnology}}` - Serialization library used (e.g., "Jackson", "Avro", "Protobuf")
- `{{EnvelopeStructureDescription}}` - Description of the top-level event envelope structure

### Pattern Definition Variables
- `{{PatternId}}` - Unique pattern identifier (e.g., "IEV-ENV-01", "IEV-PLD-01")
- `{{PatternName}}` - Descriptive name of the pattern
- `{{ClassIndexIdentifier}}` - Hash identifier from class index
- `{{FileName}}` - Source file name

### Coverage Summary Variables
- `{{TotalEventCount}}` - Total number of integration event classes analyzed
- `{{CategoryName}}` - Category name for coverage summary
- `{{EventCount}}` - Number of classes in category
- `{{CoveragePercentage}}` - Percentage coverage for category

## Usage Instructions

### 1. Pattern ID Format
- `IEV-ENV-XX`: Event envelope and metadata patterns
- `IEV-PLD-XX`: Payload and DTO structure patterns
- `IEV-NST-XX`: Nested object decomposition patterns
- `IEV-DSR-XX`: Deserialization annotation patterns
- `IEV-MAP-XX`: Domain mapping and anti-corruption patterns

### 2. Key Analysis Points
- **Envelope**: What metadata does every event carry? (id, type, version, actor, provider, published)
- **Typing**: Generic typed envelope vs. per-event specific classes?
- **Nesting**: How deep is the nesting? What are the naming conventions for nested types?
- **Nullability**: Which fields are required vs optional? How is absence handled?
- **Mapping**: Do DTOs provide toCommand()/toIncreaseStatCommand() methods? Where does validation happen?

### 3. Template Completion Checklist

- [ ] All integration event files analyzed and catalogued
- [ ] Envelope structure documented
- [ ] Serialization technology identified
- [ ] Pattern IDs assigned following naming convention
- [ ] Good/bad examples provided for major patterns
- [ ] Nested object patterns documented
- [ ] Domain mapping patterns documented
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines
