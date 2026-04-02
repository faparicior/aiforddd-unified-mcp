# 🎯 DDD Infrastructure Layer - {{PackageName}} Package Adapters (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns found in the specific codebase. Use generic names (EmailService, PaymentGateway, UserRepository, etc.).

> **Related templates**: `template-ddd-domain-interface-wow.md` (Port interfaces implemented by Adapters) | `template-ddd-mapper-wow.md` (Mappers used within Adapters)

---

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
4. [🗂️ Adapter Catalogue](#-adapter-catalogue)
5. [📐 Core Patterns and Rules](#-core-patterns-and-rules)
6. [🔌 Port-Adapter Contract](#-port-adapter-contract)
7. [🔁 Error Translation Strategy](#-error-translation-strategy)
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

**Architecture Layer:** Infrastructure Layer - Adapters

---

## 🏗️ Architecture Position

```
Domain Layer (Port Interface) ← implements ← Adapter ← wraps ← External System / Library
         UserRepository  ←  JpaUserRepository  ←  JPA / DB
         EmailPort       ←  SmtpEmailAdapter   ←  SMTP / SendGrid
         PaymentPort     ←  StripePaymentAdapter ← Stripe SDK
```

Adapters bridge domain ports to external systems. They implement domain-defined contracts and translate domain calls to external API calls.

---

## 📋 Architecture Rules

### 1. Layer Responsibility
- **Purpose**: {{LayerMainPurpose}} (implement domain ports using external libraries or services)
- **Restrictions**: {{LayerRestrictions}} (no domain business logic; translate errors to domain exceptions)

### 2. Naming Conventions
{{NamingConventionDescription}} (suffix *Adapter, *Repository (persistence), *Client (HTTP): JpaOrderRepository, StripePaymentAdapter, HttpUserClient)

### 3. Dependency Direction
{{DependencyDirectionDescription}} (adapters depend on domain interfaces, never the other way)

---

## 🗂️ Adapter Catalogue

| Adapter | Port Implemented | External System | Mapper Used | Layer |
|---------|-----------------|-----------------|-------------|-------|
| {{Adapter1}} | {{Port1}} | {{External1}} | {{Mapper1}} | {{Layer1}} |
| {{Adapter2}} | {{Port2}} | {{External2}} | {{Mapper2}} | {{Layer2}} |

---

## 📐 Core Patterns and Rules

### Wrapper Patterns

**Total Patterns Found**: {{PatternCount}}

{{#AdtWrpPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `ADT-WRP-{{RuleId}}`  
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
{{/AdtWrpPatternRules}}

### Translation Patterns

{{#AdtTrnPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `ADT-TRN-{{RuleId}}`  
**Intent**: {{PatternIntent}}

✅ **GOOD**: `{{GoodExample}}`  
❌ **BAD**: {{BadExample}} — {{WhyItsBad}}

---
{{/AdtTrnPatternRules}}

### Error Handling Patterns

{{#AdtErrPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `ADT-ERR-{{RuleId}}`  
**Intent**: {{PatternIntent}}

✅ **GOOD**: `{{GoodExample}}`

---
{{/AdtErrPatternRules}}

### Port-Contract Patterns

{{#AdtPrtPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `ADT-PRT-{{RuleId}}`  
**Intent**: {{PatternIntent}}  
**Example**: {{GoodExample}}

---
{{/AdtPrtPatternRules}}

### Testability Patterns

{{#AdtTstPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**Pattern ID**: `ADT-TST-{{RuleId}}`  
**Intent**: {{PatternIntent}}

✅ **GOOD**: `{{GoodExample}}`  
❌ **BAD**: {{BadExample}} — {{WhyItsBad}}

---
{{/AdtTstPatternRules}}

---

## 🔌 Port-Adapter Contract

### Port Definition (Domain Layer)
{{PortDefinitionDescription}} (interface defined in domain; no infrastructure imports)

```kotlin
{{PortDefinitionExample}}
```

### Adapter Implementation (Infrastructure Layer)
{{AdapterImplementationDescription}} (implements domain interface; injects external dependencies)

```kotlin
{{AdapterImplementationExample}}
```

---

## 🔁 Error Translation Strategy

### Exception Mapping
{{ExceptionMappingDescription}} (infrastructure exceptions → domain exceptions; no leaking of framework errors)

| External Exception | Domain Exception | Context |
|-------------------|-----------------|---------|
| {{ExtException1}} | {{DomainException1}} | {{Context1}} |
| {{ExtException2}} | {{DomainException2}} | {{Context2}} |

**Example:**
```kotlin
{{ErrorTranslationExample}}
```

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
**Total Infrastructure Layer Adapters Analyzed**: {{TotalAdapterCount}}

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

- `ADT-WRP-XX` — External system/library wrapping patterns
- `ADT-TRN-XX` — Data translation and transformation patterns
- `ADT-ERR-XX` — Error translation from infrastructure to domain
- `ADT-PRT-XX` — Port-contract adherence and implementation patterns
- `ADT-TST-XX` — Testability and test-double patterns
