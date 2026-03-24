# 🎯 DDD Domain Layer - {{PackageName}} Package Entities (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#️-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
4. [🪪 Identity Patterns](#-identity-patterns)
5. [🔄 Lifecycle & State Transition Patterns](#-lifecycle--state-transition-patterns)
6. [🛡️ Invariant Enforcement Patterns](#️-invariant-enforcement-patterns)
7. [⚙️ Behavior Patterns](#️-behavior-patterns)
8. [🏭 Factory & Reconstruction Patterns](#-factory--reconstruction-patterns)
9. [🛠️ Implementation Guidelines](#️-implementation-guidelines)
10. [⚠️ Error Handling Strategy](#️-error-handling-strategy)
11. [🧪 Testing Approach](#-testing-approach)
12. [🚫 Anti-Patterns to Avoid](#-anti-patterns-to-avoid)
13. [Summary](#summary)
14. [Pattern Index](#pattern-index)
15. [❓ Open Questions](#-open-questions)

## 📌 Overview

**Package:** `{{PackageName}}`
**Description:** {{PackageDescription}}
**Responsibility:** {{PrimaryResponsibility}}

**Domain Purpose:** {{DomainPurpose}}

**Architecture Layer:** Domain Layer - {{SpecificDomainLayer}}

## 🏗️ Architecture Position

```
Application Layer (Use Cases) → Domain Layer ({{PackageName}}) → Entities
```

The `{{PackageName}}` entities are the core domain objects with unique identity and lifecycle, {{ArchitectureDescription}} while keeping all infrastructure concerns outside the domain boundary.

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

## 🪪 Identity Patterns

### Identity rules by Category

#### {{IdentityCategoryName}}

{{#IdentityPatternRules}}
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

{{/IdentityPatternRules}}

---

## 🔄 Lifecycle & State Transition Patterns

### Lifecycle rules by Category

#### {{LifecycleCategoryName}}

{{#LifecyclePatternRules}}
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

{{/LifecyclePatternRules}}

---

## 🛡️ Invariant Enforcement Patterns

### Invariant rules by Category

#### {{InvariantCategoryName}}

{{#InvariantPatternRules}}
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

{{/InvariantPatternRules}}

---

## ⚙️ Behavior Patterns

### Behavior rules by Category

#### {{BehaviorCategoryName}}

{{#BehaviorPatternRules}}
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

{{/BehaviorPatternRules}}

---

## 🏭 Factory & Reconstruction Patterns

### Factory rules by Category

#### {{FactoryCategoryName}}

{{#FactoryPatternRules}}
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

{{/FactoryPatternRules}}

---

## 🛠️ Implementation Guidelines

### Identity Strategy
{{IdentityStrategyDescription}}

### State Machine Design
{{StateMachineDescription}}

### Invariant Enforcement Strategy
{{InvariantEnforcementDescription}}

### Equality and Hashing
{{EqualityHashingDescription}}

---

## ⚠️ Error Handling Strategy

### {{ErrorHandlingPattern}}
{{ErrorHandlingDescription}}

**Example:**
```kotlin
{{ErrorHandlingExample}}
```

---

## 🧪 Testing Approach

### Unit Testing
- **{{UnitTestPattern}}**: {{UnitTestDescription}}
- **Mock Strategy**: {{MockStrategy}}
- **Coverage Target**: {{CoverageTarget}}

### Entity Testing Rules

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
**Total Domain Entities Analyzed**: {{TotalEntityCount}}
{{#CoverageByCategory}}
- **{{CategoryName}}**: {{EntityCount}} entities ({{CoveragePercentage}}% coverage)
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
- `{{PatternId}}` - Unique pattern identifier (e.g., "ENT-IDN-01", "ENT-LCY-01")
- `{{PatternName}}` - Descriptive name of the pattern
- `{{ClassIndexIdentifier}}` - Hash identifier from class index
- `{{FileName}}` - Source file name

### Coverage Summary Variables
- `{{TotalEntityCount}}` - Total number of entities analyzed
- `{{CategoryName}}` - Category name for coverage summary
- `{{EntityCount}}` - Number of entities in category
- `{{CoveragePercentage}}` - Percentage coverage for category

## Usage Instructions

### 1. Pattern ID Format
- `ENT-IDN-XX`: Identity definition and equality patterns
- `ENT-LCY-XX`: Lifecycle and state transition patterns
- `ENT-INV-XX`: Invariant enforcement patterns
- `ENT-BHV-XX`: Behavior and business rule patterns
- `ENT-FAC-XX`: Factory and reconstruction patterns

### 2. Key Analysis Points
- **Identity**: How is uniqueness established? UUID? Long? Composite?
- **Mutability**: What state can change after construction? What is immutable?
- **Lifecycle**: What are the valid states and transitions?
- **Invariants**: What can never be violated? Enforced in constructor or init block?
- **Behavior**: Does the entity have rich behavior or is it anemic?

### 3. Template Completion Checklist

- [ ] All entity files analyzed and catalogued
- [ ] Identity strategy documented
- [ ] State machine/lifecycle documented (if applicable)
- [ ] Pattern IDs assigned following naming convention
- [ ] Good/bad examples provided for major patterns
- [ ] Factory and reconstruction patterns documented
- [ ] Testing approaches specified
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines
