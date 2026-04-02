# 🎯 DDD Infrastructure Layer - {{PackageName}} Package Mappers (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns found in the specific codebase. Use generic names (User, Order, Product, etc.).

> **Related templates**: `template-ddd-domain-interface-wow.md` (Port interfaces) | `template-ddd-adapter-wow.md` (Adapters using Mappers)

---

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
4. [🗂️ Mapper Catalogue](#-mapper-catalogue)
5. [📐 Core Patterns and Rules](#-core-patterns-and-rules)
6. [↔️ Mapping Direction Conventions](#-mapping-direction-conventions)
7. [🔢 Null & Optional Handling](#-null--optional-handling)
8. [🔠 Type Conversion Reference](#-type-conversion-reference)
9. [🛠️ Implementation Guidelines](#-implementation-guidelines)
10. [🧪 Testing Approach](#-testing-approach)
11. [🚫 Anti-Patterns to Avoid](#-anti-patterns-to-avoid)
12. [Summary](#summary)
13. [Pattern Index](#pattern-index)
14. [❓ Open Questions](#-open-questions)

---

## 📌 Overview

**Package:** `{{PackageName}}`  
**Description:** {{PackageDescription}}  
**Responsibility:** {{PrimaryResponsibility}}

**Architecture Layer:** Infrastructure Layer - Mappers

---

## 🏗️ Architecture Position

```
Infrastructure Layer → Mapper → Domain Objects ↔ External Representations
                     toDomain(dto)  ↔  toDto(entity)
                     toPersistence(entity) ↔ toDomain(row)
```

Mappers are pure translation functions. They live in the Infrastructure Layer and keep Framework/DB details out of the Domain.

---

## 📋 Architecture Rules

### 1. Layer Responsibility
- **Purpose**: {{LayerMainPurpose}} (bidirectional translation between domain and external representations)
- **Restrictions**: {{LayerRestrictions}} (no business logic; no I/O; pure mapping only)

### 2. Naming Conventions
{{NamingConventionDescription}} (suffix *Mapper: UserMapper, OrderPersistenceMapper, ProductDtoMapper)

### 3. Method Naming
{{MethodNamingDescription}} (`toDomain`, `toDto`, `toPersistence`, `toResponse`, `fromRequest`)

---

## 🗂️ Mapper Catalogue

| Mapper | Source Type | Target Type | Direction | Layer |
|--------|-------------|-------------|-----------|-------|
| {{Mapper1}} | {{SourceType1}} | {{TargetType1}} | {{Direction1}} | {{Layer1}} |
| {{Mapper2}} | {{SourceType2}} | {{TargetType2}} | {{Direction2}} | {{Layer2}} |

---

## 📐 Core Patterns and Rules

### Domain Mapping Patterns

**Total Patterns Found**: {{PatternCount}}

{{#MapDomPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `MAP-DOM-{{RuleId}}`  
**Intent**: {{PatternIntent}}  
**Source**: {{SourceFile}} [{{ClassIndexIdentifier}}]

✅ **GOOD**:
```kotlin
{{GoodExample}}
```

❌ **BAD**:
```kotlin
{{BadExample}}
```
**Why**: {{WhyItsBad}}

---
{{/MapDomPatternRules}}

### Persistence Mapping Patterns

{{#MapPrsPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `MAP-PRS-{{RuleId}}`  
**Intent**: {{PatternIntent}}

✅ **GOOD**: `{{GoodExample}}`  
❌ **BAD**: {{BadExample}} — {{WhyItsBad}}

---
{{/MapPrsPatternRules}}

### Null & Optional Patterns

{{#MapNulPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `MAP-NUL-{{RuleId}}`  
**Intent**: {{PatternIntent}}

✅ **GOOD**: `{{GoodExample}}`

---
{{/MapNulPatternRules}}

### Complex Mapping Patterns

{{#MapCmxPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `MAP-CMX-{{RuleId}}`  
**Intent**: {{PatternIntent}}  
**Example**: {{GoodExample}}

---
{{/MapCmxPatternRules}}

### Type Conversion Patterns

{{#MapTypPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `MAP-TYP-{{RuleId}}`  
**Intent**: {{PatternIntent}}

✅ **GOOD**: `{{GoodExample}}`  
❌ **BAD**: {{BadExample}} — {{WhyItsBad}}

---
{{/MapTypPatternRules}}

---

## ↔️ Mapping Direction Conventions

### Inbound (External → Domain)
{{InboundDirectionDescription}} (`toEntity`, `toDomain`, `fromRequest`)

### Outbound (Domain → External)
{{OutboundDirectionDescription}} (`toDto`, `toResponse`, `toPersistenceRow`)

**Standard Method Example:**
```kotlin
{{DirectionExample}}
```

---

## 🔢 Null & Optional Handling

### Null Strategy
{{NullStrategyDescription}} (fail-fast, default values, Optional.empty())

### Optional Fields
{{OptionalFieldDescription}} (nullable domain fields vs. required DTO fields)

---

## 🔠 Type Conversion Reference

| Source Type | Target Type | Conversion Strategy |
|-------------|-------------|---------------------|
| {{SourceType1}} | {{TargetType1}} | {{ConversionStrategy1}} |
| {{SourceType2}} | {{TargetType2}} | {{ConversionStrategy2}} |

---

## 🛠️ Implementation Guidelines

{{#ImplementationGuidelines}}
### {{GuidelineName}}
{{GuidelineDescription}}

```kotlin
{{GuidelineExample}}
```
{{/ImplementationGuidelines}}

---

## 🧪 Testing Approach

{{TestingDescription}}

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
{{/AntiPatterns}}

---

## Summary

{{#KeyDecisions}}
- **{{DecisionName}}**: {{DecisionDescription}}
{{/KeyDecisions}}

---

## Pattern Index

{{#PatternCategories}}
### {{CategoryName}} Patterns
{{#Patterns}}
{{PatternIndex}}. **{{PatternId}}**: {{PatternName}} - [{{ClassIndexIdentifier}}] {{FileName}}
{{/Patterns}}
{{/PatternCategories}}

### Coverage Summary
**Total Infrastructure Layer Mappers Analyzed**: {{TotalMapperCount}}

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

> **⚠️ TEMPLATE INSTRUCTIONS BELOW THIS POINT - DO NOT INCLUDE IN FINAL DOCUMENTS**

## Template Variables Reference

- `MAP-DOM-XX` — Domain object mapping (toDomain / fromDomain)
- `MAP-PRS-XX` — Persistence/database mapping patterns
- `MAP-NUL-XX` — Null and optional value handling
- `MAP-CMX-XX` — Complex nested or collection mapping patterns
- `MAP-TYP-XX` — Type conversion and value object mapping
