# 🎯 DDD Domain Layer - {{PackageName}} Package Sagas (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns found in the specific codebase. Use generic names (Order, Payment, Shipment, etc.).

> **Related templates**: `template-ddd-use-case-wow.md` (Use Cases trigger Sagas) | `template-ddd-domain-event-wow.md` (Events emitted by Sagas)

---

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
4. [🗂️ Saga Catalogue](#-saga-catalogue)
5. [📐 Core Patterns and Rules](#-core-patterns-and-rules)
6. [🪜 Step Design](#-step-design)
7. [↩️ Compensation Strategy](#-compensation-strategy)
8. [🔄 State Management](#-state-management)
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

**Architecture Layer:** Domain Layer / Application Layer - Sagas

---

## 🏗️ Architecture Position

```
Use Case → triggers → Saga → orchestrates → Step 1 → Step 2 → ... → Step N
                                          ↓ (on failure)
                                Compensation Step N → ... → Compensation Step 1
```

Sagas implement distributed transactions via sequential steps with compensation logic to maintain consistency without distributed locks.

---

## 📋 Architecture Rules

### 1. Layer Responsibility
- **Purpose**: {{LayerMainPurpose}} (long-running process orchestration, consistency without 2PC)
- **Restrictions**: {{LayerRestrictions}} (no direct domain logic; delegate to domain services/entities)

### 2. Naming Conventions
{{NamingConventionDescription}} (suffix *Saga, *Workflow, *Process: OrderFulfillmentSaga, PaymentSaga)

### 3. Step Structure
{{StepStructureDescription}} (each step: execute + compensate pair; idempotent design)

---

## 🗂️ Saga Catalogue

| Saga | Steps | Compensations | Triggered By | Consistency Boundary |
|------|-------|---------------|--------------|---------------------|
| {{Saga1}} | {{Steps1}} | {{Compensations1}} | {{TriggeredBy1}} | {{Boundary1}} |
| {{Saga2}} | {{Steps2}} | {{Compensations2}} | {{TriggeredBy2}} | {{Boundary2}} |

---

## 📐 Core Patterns and Rules

### Saga Step Patterns

**Total Patterns Found**: {{PatternCount}}

{{#SagaStpPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `SAGA-STP-{{RuleId}}`  
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
{{/SagaStpPatternRules}}

### Compensation Patterns

{{#SagaCmpPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `SAGA-CMP-{{RuleId}}`  
**Intent**: {{PatternIntent}}

✅ **GOOD**: `{{GoodExample}}`  
❌ **BAD**: {{BadExample}} — {{WhyItsBad}}

---
{{/SagaCmpPatternRules}}

### State Tracking Patterns

{{#SagaSttPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `SAGA-STT-{{RuleId}}`  
**Intent**: {{PatternIntent}}

✅ **GOOD**: `{{GoodExample}}`

---
{{/SagaSttPatternRules}}

### Event Integration Patterns

{{#SagaEvtPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `SAGA-EVT-{{RuleId}}`  
**Intent**: {{PatternIntent}}  
**Example**: {{GoodExample}}

---
{{/SagaEvtPatternRules}}

### Error Handling Patterns

{{#SagaErrPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `SAGA-ERR-{{RuleId}}`  
**Intent**: {{PatternIntent}}

✅ **GOOD**: `{{GoodExample}}`  
❌ **BAD**: {{BadExample}} — {{WhyItsBad}}

---
{{/SagaErrPatternRules}}

---

## 🪜 Step Design

### Step Interface
{{StepInterfaceDescription}} (execute/compensate contract, idempotency key)

**Example:**
```kotlin
{{StepInterfaceExample}}
```

### Execution Order
{{ExecutionOrderDescription}} (linear, branching, parallel)

---

## ↩️ Compensation Strategy

### Compensation Trigger
{{CompensationTriggerDescription}} (on any step failure, explicit rollback)

### Partial Completion
{{PartialCompletionDescription}} (already-completed steps compensation, idempotency)

**Example:**
```kotlin
{{CompensationExample}}
```

---

## 🔄 State Management

### Saga State
{{SagaStateDescription}} (persisted journal, event-sourced, in-memory)

### State Transitions
{{StateTransitionDescription}} (PENDING → EXECUTING → COMPLETED | COMPENSATING → FAILED)

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
**Total Sagas Analyzed**: {{TotalSagaCount}}

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

- `SAGA-STP-XX` — Saga step definition and execution patterns
- `SAGA-CMP-XX` — Compensation and rollback patterns
- `SAGA-STT-XX` — State tracking and journal patterns
- `SAGA-EVT-XX` — Domain event integration within saga steps
- `SAGA-ERR-XX` — Error handling and failure recovery patterns
