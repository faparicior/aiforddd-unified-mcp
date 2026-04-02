# 🎯 DDD Domain Layer - {{PackageName}} Package Policies (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns found in the specific codebase. Use generic names (Order, User, Product, etc.).

> **Related templates**: `template-ddd-domain-service-wow.md` (Domain Services) | `template-ddd-specification-wow.md` (Specifications)

---

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
4. [🗂️ Policy Catalogue](#-policy-catalogue)
5. [📐 Core Patterns and Rules](#-core-patterns-and-rules)
6. [🔌 Strategy & Injection](#-strategy--injection)
7. [🔄 Policy Evolution](#-policy-evolution)
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

**Architecture Layer:** Domain Layer - Policies

---

## 🏗️ Architecture Position

```
Domain Service / Use Case → injects → Policy (Strategy) → executes → Business Decision
DI Container / Configuration → selects → Concrete Policy Variant
```

Policies replace conditional logic with polymorphism. Each variant encapsulates one specific business decision strategy.

---

## 📋 Architecture Rules

### 1. Layer Responsibility
- **Purpose**: {{LayerMainPurpose}} (strategy execution only, no orchestration)
- **Restrictions**: {{LayerRestrictions}} (stateless preferred; no direct I/O unless injected)

### 2. Naming Conventions
{{NamingConventionDescription}} (suffix *Policy, *Strategy, *Rule: ShippingPolicy, TaxPolicy, DiscountPolicy)

### 3. Interface Design
{{InterfaceDesignDescription}} (one interface per policy concern; implementations per strategy variant)

---

## 🗂️ Policy Catalogue

| Policy Interface | Variants | Injected Into | Default |
|-----------------|----------|---------------|---------|
| {{Policy1}} | {{Variants1}} | {{InjectedInto1}} | {{Default1}} |
| {{Policy2}} | {{Variants2}} | {{InjectedInto2}} | {{Default2}} |

---

## 📐 Core Patterns and Rules

### Policy Definition Patterns

**Total Patterns Found**: {{PatternCount}}

{{#PolDefPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `POL-DEF-{{RuleId}}`  
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
{{/PolDefPatternRules}}

### Strategy & Injection Patterns

{{#PolStgPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `POL-STG-{{RuleId}}`  
**Intent**: {{PatternIntent}}

✅ **GOOD**: `{{GoodExample}}`  
❌ **BAD**: {{BadExample}} — {{WhyItsBad}}

---
{{/PolStgPatternRules}}

### Injection Patterns

{{#PolInjPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `POL-INJ-{{RuleId}}`  
**Intent**: {{PatternIntent}}

✅ **GOOD**: `{{GoodExample}}`

---
{{/PolInjPatternRules}}

### Evolution Patterns

{{#PolEvoPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `POL-EVO-{{RuleId}}`  
**Intent**: {{PatternIntent}}  
**Example**: {{GoodExample}}

---
{{/PolEvoPatternRules}}

### Evaluation & Lifecycle Patterns

{{#PolEvlPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `POL-EVL-{{RuleId}}`  
**Intent**: {{PatternIntent}}

✅ **GOOD**: `{{GoodExample}}`  
❌ **BAD**: {{BadExample}} — {{WhyItsBad}}

---
{{/PolEvlPatternRules}}

---

## 🔌 Strategy & Injection

### Injection Mechanism
{{InjectionMechanismDescription}} (constructor injection, DI qualifier, factory)

### Default Policy
{{DefaultPolicyDescription}} (null object pattern, fallback variant)

**Example:**
```kotlin
{{InjectionExample}}
```

---

## 🔄 Policy Evolution

### Adding New Variants
{{AddVariantGuidelines}}

### Deprecating Variants
{{DeprecateVariantGuidelines}}

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
**Total Domain Layer Policies Analyzed**: {{TotalPolicyCount}}

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

- `POL-DEF-XX` — Policy definition and interface patterns
- `POL-STG-XX` — Strategy selection and injection patterns
- `POL-INJ-XX` — Injection and wiring patterns
- `POL-EVO-XX` — Policy evolution and versioning patterns
- `POL-EVL-XX` — Evaluation, lifecycle, and composition patterns
