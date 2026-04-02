# 🎯 DDD Domain Layer - {{PackageName}} Package Specifications (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

> **Related templates**: `template-ddd-domain-service-wow.md` (Domain Services) | `template-ddd-entity-wow.md` (Entities) | `template-ddd-domain-interface-wow.md` (Domain Interfaces)

---

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
4. [🗂️ Specification Catalogue](#-specification-catalogue)
5. [📐 Core Patterns and Rules](#-core-patterns-and-rules)
6. [🔗 Composition Strategy](#-composition-strategy)
7. [📍 Usage Patterns](#-usage-patterns)
8. [🛠️ Implementation Guidelines](#-implementation-guidelines)
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

**Architecture Layer:** Domain Layer - Specifications

---

## 🏗️ Architecture Position

```
Domain Service / Use Case → uses → Specification → tests → Domain Object (Entity/Aggregate)
Repository → uses → Specification → as query criteria
```

Specifications encapsulate reusable, composable business predicates that can be combined using `and()`, `or()`, `not()` to form complex business rules without duplicating logic.

### Package Structure Convention
_[Describe the package naming and organization pattern]_

---

## 📋 Architecture Rules

### 1. Layer Responsibility
- **Purpose**: {{LayerMainPurpose}} (predicate logic only, no orchestration)
- **Restrictions**: {{LayerRestrictions}} (no side effects, no I/O, must be pure functions)

### 2. Naming Conventions
{{NamingConventionDescription}} (suffix *Specification, *Spec, or descriptive predicate: EligibleFor*, HasValid*, IsActive*)

### 3. Composition Rules
{{CompositionRulesDescription}} (support and/or/not; prefer immutable instances)

---

## 🗂️ Specification Catalogue

| Specification | Predicate | Used By | Layer |
|--------------|-----------|---------|-------|
| {{Spec1}} | {{Predicate1}} | {{UsedBy1}} | Domain Layer |
| {{Spec2}} | {{Predicate2}} | {{UsedBy2}} | Domain Layer |

---

## 📐 Core Patterns and Rules

### Specification Definition Patterns

**Total Patterns Found**: {{PatternCount}}

{{#SpecDefPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `SPEC-DEF-{{RuleId}}`  
**Intent**: {{PatternIntent}}  
**Source**: {{SourceFile}} [{{ClassIndexIdentifier}}]

✅ **GOOD Example**:
```kotlin
{{GoodExample}}
```

❌ **BAD Example**:
```kotlin
{{BadExample}}
```
**Why it's bad**: {{WhyItsBad}}

---
{{/SpecDefPatternRules}}

### Composition Patterns

{{#SpecCplPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `SPEC-CPL-{{RuleId}}`  
**Intent**: {{PatternIntent}}

✅ **GOOD**:
```kotlin
{{GoodExample}}
```

❌ **BAD**: {{BadExample}}  
**Why**: {{WhyItsBad}}

---
{{/SpecCplPatternRules}}

### Usage Patterns

{{#SpecUsgPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `SPEC-USG-{{RuleId}}`  
**Intent**: {{PatternIntent}}

✅ **GOOD**: `{{GoodExample}}`  
❌ **BAD**: {{BadExample}} — {{WhyItsBad}}

---
{{/SpecUsgPatternRules}}

### Naming & Grouping Patterns

{{#SpecNmgPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `SPEC-NMG-{{RuleId}}`  
**Intent**: {{PatternIntent}}  
**Example**: {{GoodExample}}

---
{{/SpecNmgPatternRules}}

### Parameter & Dependency Patterns

{{#SpecPrmPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `SPEC-PRM-{{RuleId}}`  
**Intent**: {{PatternIntent}}

✅ **GOOD**:
```kotlin
{{GoodExample}}
```

❌ **BAD**: {{BadExample}} — {{WhyItsBad}}

---
{{/SpecPrmPatternRules}}

---

## 🔗 Composition Strategy

### Composite Specification Design
{{CompositeSpecificationDescription}}

**Example:**
```kotlin
{{CompositionExample}}
```

---

## 📍 Usage Patterns

### In Domain Services
{{DomainServiceUsageDescription}}

### In Repositories (Query Criteria)
{{RepositoryUsageDescription}}

### In Entity Validation
{{EntityValidationUsageDescription}}

---

## 🛠️ Implementation Guidelines

### Method Signature Design
{{MethodSignatureGuidelines}}

### Immutability
{{ImmutabilityGuidelines}}

{{#ImplementationGuidelines}}
### {{GuidelineName}}
{{GuidelineDescription}}

**Example:**
```kotlin
{{GuidelineExample}}
```
{{/ImplementationGuidelines}}

---

## 🧪 Testing Approach

### Unit Testing Specifications
{{UnitTestingDescription}}

**Key Test Scenarios:**
{{#TestScenarios}}
- {{TestScenario}}
{{/TestScenarios}}

---

## 🚫 Anti-Patterns to Avoid

{{#AntiPatterns}}
### ❌ {{AntiPatternName}}
**Problem**: {{AntiPatternProblem}}
**Solution**: {{AntiPatternSolution}}

```kotlin
// BAD
{{AntiPatternBadCode}}

// GOOD
{{AntiPatternGoodCode}}
```
{{/AntiPatterns}}

---

## Summary

### Key Decisions Made
{{#KeyDecisions}}
- **{{DecisionName}}**: {{DecisionDescription}}
{{/KeyDecisions}}

### Specification Design Principles
{{DesignPrinciples}}

---

## Pattern Index

{{#PatternCategories}}
### {{CategoryName}} Patterns
{{#Patterns}}
{{PatternIndex}}. **{{PatternId}}**: {{PatternName}} - [{{ClassIndexIdentifier}}] {{FileName}}
{{/Patterns}}

{{/PatternCategories}}

### Coverage Summary
**Total Domain Layer Specifications Analyzed**: {{TotalSpecCount}}
{{#CoverageByCategory}}
- **{{CategoryName}}**: {{SpecCount}} specifications
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

- `SPEC-DEF-XX` — Specification definition and predicate patterns
- `SPEC-CPL-XX` — Composition and combinatorial patterns
- `SPEC-USG-XX` — Usage in services, repositories, and entities
- `SPEC-NMG-XX` — Naming, grouping, and organisation patterns
- `SPEC-PRM-XX` — Parameter injection and dependency handling patterns
