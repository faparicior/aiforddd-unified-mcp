# 🎯 DDD Infrastructure Layer - {{PackageName}} Package Configuration (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

> This document defines Configuration class patterns for the `{{PackageName}}` package — Spring @Configuration classes, application entry points, bean wiring, and infrastructure setup.
>
> **Related templates**: `template-ddd-repository-wow.md` | `template-ddd-api-client-wow.md` | `template-ddd-integration-service-wow.md`

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#️-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
4. [🔌 Application Wiring Patterns](#-application-wiring-patterns)
5. [🏗 Infrastructure Bean Patterns](#-infrastructure-bean-patterns)
6. [🌐 External Client Configuration Patterns](#-external-client-configuration-patterns)
7. [📨 Messaging Configuration Patterns](#-messaging-configuration-patterns)
8. [🚀 Application Entry Point Patterns](#-application-entry-point-patterns)
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

**Architecture Layer:** Infrastructure Layer - Configuration
**Framework:** `{{FrameworkTechnology}}`

## 🏗️ Architecture Position

```
Application Layer (Ports) ← Configuration (Bean Wiring) → Infrastructure Adapters
```

The `{{PackageName}}` configuration classes wire the hexagonal architecture together, {{ArchitectureDescription}} connecting port interfaces to their adapter implementations without leaking infrastructure details into the domain.

---

## 📋 Architecture Rules

### 1. Layer Responsibility
- **Purpose**: {{LayerMainPurpose}}
- **Dependencies**: {{AllowedDependencies}}
- **Restrictions**: {{LayerRestrictions}}

### 2. Configuration Split Strategy

| Configuration Class | Responsibility |
|--------------------|---------------|
| {{ConfigClass1}} | {{ConfigClass1Responsibility}} |
| {{ConfigClass2}} | {{ConfigClass2Responsibility}} |
| {{ConfigClass3}} | {{ConfigClass3Responsibility}} |

### 3. Package Structure Convention
{{PackageNamingPattern}}

---

## 🔌 Application Wiring Patterns

### Application Wiring rules by Category

#### {{WiringCategoryName}}

{{#WiringPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**✅ GOOD - {{PatternDescription}}:**

```kotlin
{{GoodPatternExample}}
```
**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**Key Benefits:**
{{#Benefits}}
- **{{BenefitName}}**: {{BenefitDescription}}
{{/Benefits}}

**❌ BAD - {{AntiPatternDescription}}:**
```kotlin
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}
- {{Reason}}
{{/AntiPatternReasons}}

{{/WiringPatternRules}}

---

## 🏗 Infrastructure Bean Patterns

### Infrastructure Bean rules by Category

#### {{InfrastructureCategoryName}}

{{#InfrastructurePatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**✅ GOOD - {{PatternDescription}}:**

```kotlin
{{GoodPatternExample}}
```
**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**Key Benefits:**
{{#Benefits}}
- **{{BenefitName}}**: {{BenefitDescription}}
{{/Benefits}}

**❌ BAD - {{AntiPatternDescription}}:**
```kotlin
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}
- {{Reason}}
{{/AntiPatternReasons}}

{{/InfrastructurePatternRules}}

---

## 🌐 External Client Configuration Patterns

### External Client rules by Category

#### {{ClientCategoryName}}

{{#ClientPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**✅ GOOD - {{PatternDescription}}:**

```kotlin
{{GoodPatternExample}}
```
**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**Key Benefits:**
{{#Benefits}}
- **{{BenefitName}}**: {{BenefitDescription}}
{{/Benefits}}

**❌ BAD - {{AntiPatternDescription}}:**
```kotlin
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}
- {{Reason}}
{{/AntiPatternReasons}}

{{/ClientPatternRules}}

---

## 📨 Messaging Configuration Patterns

### Messaging rules by Category

#### {{MessagingCategoryName}}

{{#MessagingPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**✅ GOOD - {{PatternDescription}}:**

```kotlin
{{GoodPatternExample}}
```
**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**Key Benefits:**
{{#Benefits}}
- **{{BenefitName}}**: {{BenefitDescription}}
{{/Benefits}}

**❌ BAD - {{AntiPatternDescription}}:**
```kotlin
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}
- {{Reason}}
{{/AntiPatternReasons}}

{{/MessagingPatternRules}}

---

## 🚀 Application Entry Point Patterns

### Entry Point rules by Category

#### {{EntryPointCategoryName}}

{{#EntryPointPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**✅ GOOD - {{PatternDescription}}:**

```kotlin
{{GoodPatternExample}}
```
**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**Key Benefits:**
{{#Benefits}}
- **{{BenefitName}}**: {{BenefitDescription}}
{{/Benefits}}

**❌ BAD - {{AntiPatternDescription}}:**
```kotlin
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}
- {{Reason}}
{{/AntiPatternReasons}}

{{/EntryPointPatternRules}}

---

## 🛠️ Implementation Guidelines

### Configuration Split Strategy
{{ConfigurationSplitDescription}}

### Bean Naming Conventions
{{BeanNamingConventions}}

### Property Injection Strategy
{{PropertyInjectionDescription}}

### Multi-Site / Multi-Tenant Configuration
{{MultiSiteDescription}}

---

## 🧪 Testing Approach

### Unit Testing
- **{{UnitTestPattern}}**: {{UnitTestDescription}}
- **Mock Strategy**: {{MockStrategy}}
- **Coverage Target**: {{CoverageTarget}}

### Configuration Testing Rules

{{#GoodTestExamples}}
#### ✅ Good Test Structure
```kotlin
{{GoodTestExample}}
```

{{/GoodTestExamples}}

{{#BadTestExamples}}
#### ❌ Bad Test Patterns
```kotlin
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
**Total Configuration Classes Analyzed**: {{TotalConfigCount}}
{{#CoverageByCategory}}
- **{{CategoryName}}**: {{ConfigCount}} classes ({{CoveragePercentage}}% coverage)
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

### Configuration Variables
- `{{FrameworkTechnology}}` - Framework used (e.g., "Spring Boot", "Micronaut", "Quarkus")
- `{{ConfigClass1}}` / `{{ConfigClass1Responsibility}}` - Configuration class name and its responsibility

### Pattern Definition Variables
- `{{PatternId}}` - Unique pattern identifier (e.g., "CFG-WIR-01", "CFG-INF-01")
- `{{PatternName}}` - Descriptive name of the pattern
- `{{ClassIndexIdentifier}}` - Hash identifier from class index
- `{{FileName}}` - Source file name

### Coverage Summary Variables
- `{{TotalConfigCount}}` - Total number of configuration classes analyzed
- `{{CategoryName}}` - Category name for coverage summary
- `{{ConfigCount}}` - Number of classes in category
- `{{CoveragePercentage}}` - Percentage coverage for category

## Usage Instructions

### 1. Pattern ID Format
- `CFG-WIR-XX`: Application wiring and bean composition patterns
- `CFG-INF-XX`: Infrastructure bean instantiation patterns
- `CFG-CLT-XX`: External client configuration patterns
- `CFG-MSG-XX`: Messaging and stream configuration patterns
- `CFG-APP-XX`: Application entry point and bootstrap patterns

### 2. Key Analysis Points
- **Split**: How are configuration concerns split across multiple @Configuration classes?
- **Ports & Adapters**: How are domain port interfaces connected to infrastructure adapters?
- **Properties**: How are external config properties (@Value, @ConfigurationProperties) injected?
- **Multi-instance**: Are beans created per-site, per-tenant, or per-topic? How?
- **Entry point**: What annotations are on the main class? How is component scan scoped?

### 3. Template Completion Checklist

- [ ] All configuration files analyzed and catalogued
- [ ] Configuration split strategy documented
- [ ] Bean wiring patterns documented
- [ ] External client configuration patterns documented
- [ ] Messaging configuration patterns documented
- [ ] Entry point annotations documented
- [ ] Pattern IDs assigned following naming convention
- [ ] Good/bad examples provided for major patterns
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines
