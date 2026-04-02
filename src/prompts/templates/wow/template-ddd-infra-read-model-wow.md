# 🎯 DDD Infrastructure Layer - {{PackageName}} Package Read Models & Projections (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns found in the specific codebase. Use generic names (OrderSummary, ProductCatalog, UserProfile, etc.).

> **Related templates**: `template-ddd-domain-event-wow.md` (Events consumed by Projections) | `template-ddd-adapter-wow.md` (Query-side adapters)

---

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
4. [🗂️ Projection & Read Model Catalogue](#-projection--read-model-catalogue)
5. [📐 Core Patterns and Rules](#-core-patterns-and-rules)
6. [🏛️ CQRS Read Side Architecture](#-cqrs-read-side-architecture)
7. [⚙️ Projection Strategy](#-projection-strategy)
8. [🔄 Consistency Model](#-consistency-model)
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

**Architecture Layer:** Infrastructure Layer - Read Models & Projections

---

## 🏗️ Architecture Position

```
Write Side: Command → Use Case → Aggregate → Domain Event
                                                    ↓
Read Side:                          Event Handler → Projection → Read Model Store
                                                                         ↓
                                                               Query → Read Model (DTO)
```

Projections consume domain events and build denormalized read models optimized for queries. Read models are returned directly to callers without domain object reconstruction.

---

## 📋 Architecture Rules

### 1. Layer Responsibility
- **Purpose**: {{LayerMainPurpose}} (build and maintain query-optimized views from domain events)
- **Restrictions**: {{LayerRestrictions}} (no command handling; no business logic; eventual consistency is acceptable)

### 2. Naming Conventions
{{NamingConventionDescription}} (suffix *Projection for builders, *ReadModel / *View / *Summary for query results: OrderSummaryProjection, ProductCatalogView)

### 3. CQRS Separation
{{CqrsSeparationDescription}} (read models never used on write side; projections never issue commands)

---

## 🗂️ Projection & Read Model Catalogue

### Projections (Write → Read translators)

| Projection | Events Consumed | Read Model Updated | Rebuild Strategy |
|------------|----------------|-------------------|-----------------|
| {{Projection1}} | {{Events1}} | {{ReadModel1}} | {{Rebuild1}} |
| {{Projection2}} | {{Events2}} | {{ReadModel2}} | {{Rebuild2}} |

### Read Models (Query surfaces)

| Read Model | Fields | Query Methods | Store |
|------------|--------|---------------|-------|
| {{ReadModel1}} | {{Fields1}} | {{QueryMethods1}} | {{Store1}} |
| {{ReadModel2}} | {{Fields2}} | {{QueryMethods2}} | {{Store2}} |

---

## 📐 Core Patterns and Rules

### Read Model Structure Patterns

**Total Patterns Found**: {{PatternCount}}

{{#RmStrPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `RM-STR-{{RuleId}}`  
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
{{/RmStrPatternRules}}

### Projection Build Patterns

{{#RmBldPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `RM-BLD-{{RuleId}}`  
**Intent**: {{PatternIntent}}

✅ **GOOD**: `{{GoodExample}}`  
❌ **BAD**: {{BadExample}} — {{WhyItsBad}}

---
{{/RmBldPatternRules}}

### Query Patterns

{{#RmQryPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `RM-QRY-{{RuleId}}`  
**Intent**: {{PatternIntent}}

✅ **GOOD**: `{{GoodExample}}`

---
{{/RmQryPatternRules}}

### Synchronization Patterns

{{#RmSycPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `RM-SYC-{{RuleId}}`  
**Intent**: {{PatternIntent}}  
**Example**: {{GoodExample}}

---
{{/RmSycPatternRules}}

### Evaluation & Rebuild Patterns

{{#RmEvlPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `RM-EVL-{{RuleId}}`  
**Intent**: {{PatternIntent}}

✅ **GOOD**: `{{GoodExample}}`  
❌ **BAD**: {{BadExample}} — {{WhyItsBad}}

---
{{/RmEvlPatternRules}}

---

## 🏛️ CQRS Read Side Architecture

### Query Dispatcher
{{QueryDispatcherDescription}} (query bus, direct query service, repository query methods)

```kotlin
{{QueryDispatcherExample}}
```

### Read Model Repository
{{ReadModelRepositoryDescription}} (dedicated read store, same DB read-only view, cache layer)

---

## ⚙️ Projection Strategy

### Event Subscription
{{EventSubscriptionDescription}} (event bus listener, message consumer, in-process observer)

### Projection Rebuild
{{ProjectionRebuildDescription}} (full replay from event store, incremental from snapshot, scheduled update)

**Example:**
```kotlin
{{ProjectionBuildExample}}
```

---

## 🔄 Consistency Model

### Eventual Consistency
{{EventualConsistencyDescription}} (acceptable lag, SLA on projection delay)

### Idempotency
{{IdempotencyDescription}} (duplicate event handling, version tracking)

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
**Total Read Models & Projections Analyzed**: {{TotalReadModelCount}}

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

- `RM-STR-XX` — Read model structure and field design patterns
- `RM-BLD-XX` — Projection build and event consumption patterns
- `RM-QRY-XX` — Query method and query dispatcher patterns
- `RM-SYC-XX` — Synchronization and event ordering patterns
- `RM-EVL-XX` — Evaluation, rebuild, and consistency assessment patterns
