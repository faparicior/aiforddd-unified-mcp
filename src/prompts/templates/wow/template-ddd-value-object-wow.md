# 🎯 DDD Domain Layer - {{PackageName}} Package Value Objects (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

## Table of Contents

1. [Overview](#overview)
2. [Architecture Position](#️-architecture-position)
3. [Architecture Rules](#architecture-rules)
   - [Layer Responsibility](#1-layer-responsibility)
   - [Package Structure Convention](#2-package-structure-convention)
4. [Value Object Patterns](#value-object-patterns)
5. [Validation Patterns](#validation-patterns)
6. [Implementation Guidelines](#️-implementation-guidelines)
7. [Error Handling Strategy](#️-error-handling-strategy)
8. [Testing Approach](#-testing-approach)
9. [Performance Considerations](#-performance-considerations)
10. [Anti-Patterns to Avoid](#-anti-patterns-to-avoid)
11. [Summary](#summary)
12. [Pattern Index](#pattern-index)
13. [Open Questions](#-open-questions)
14. [Changelog](#-changelog)

## Overview

**Package:** `{{PackageName}}`  
**Description:** {{PackageDescription}}  
**Responsibility:** {{PrimaryResponsibility}}

**Domain Purpose:** {{DomainPurpose}}

**Architecture Layer:** Domain Layer - {{SpecificDomainLayer}}

## 🏗️ Architecture Position

```
UI Layer → Application Layer → Domain Layer ({{PackageName}}) → Value Objects
```

The `{{PackageName}}` value objects form the foundation of the domain model, {{ArchitectureDescription}} while maintaining proper encapsulation and {{SpecificConcerns}}.

---

## Architecture Rules

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

## Value Object Patterns

### Value Object rules by Category

#### {{ValueObjectCategoryName}}

{{#ValueObjectPatternRules}}
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

{{/ValueObjectPatternRules}}

## Validation Patterns

### Validation rules by Category

#### {{ValidationCategoryName}}

{{#ValidationPatternRules}}
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

{{/ValidationPatternRules}}

---

## 🛠️ Implementation Guidelines

### Immutability
- **{{ImmutabilityPattern}}**: {{ImmutabilityDescription}}
- **Configuration**: {{ImmutabilityConfiguration}}
- **Lifecycle**: {{ImmutabilityLifecycle}}

### Validation Strategy
{{ValidationStrategyDescription}}

### Equality and Hashing
{{EqualityHashingDescription}}

### String Representation
{{StringRepresentationDescription}}

---

## ⚠️ Error Handling Strategy

### {{ErrorHandlingPattern}}
{{ErrorHandlingDescription}}

**Example:**
```kotlin
{{ErrorHandlingExample}}
```

### {{ErrorRecoveryPattern}}
{{ErrorRecoveryDescription}}

### {{ErrorLoggingPattern}}
{{ErrorLoggingDescription}}

---

## 🧪 Testing Approach

### Unit Testing
- **{{UnitTestPattern}}**: {{UnitTestDescription}}
- **Mock Strategy**: {{MockStrategy}}
- **Coverage Target**: {{CoverageTarget}}

### Property Testing
- **{{PropertyTestPattern}}**: {{PropertyTestDescription}}
- **Test Environment**: {{TestEnvironment}}
- **Data Setup**: {{DataSetupStrategy}}

### Value Object Testing Rules

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

## ⚡ Performance Considerations

{{#PerformancePatterns}}
### {{PerformancePatternName}}
{{PerformancePatternDescription}}

{{/PerformancePatterns}}

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
**Total {{LayerName}} Value Objects Analyzed**: {{TotalValueObjectCount}}
{{#CoverageByCategory}}
- **{{CategoryName}}**: {{ValueObjectCount}} value objects ({{CoveragePercentage}}% coverage)
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

Use @context/templates/ai-development/ai-definitions/template-changelog-content.md as a reference for changelog management.
Use @context/templates/ai-development/ai-definitions/ddd-discovery/definition-template-generic-id-management-guidelines.md for pattern ID management.

## Template Variables Reference

### Pattern Definition Variables
- `{{DomainCategory1Name}}` - Name of first value object pattern category (e.g., "Domain Layer - Primitive Wrappers")
- `{{DomainCategory2Name}}` - Name of second value object pattern category (e.g., "Domain Layer - Complex Value Objects")
- `{{PatternId}}` - Unique pattern identifier (e.g., "VO-PRM-01", "VO-CPX-01")
- `{{PatternName}}` - Descriptive name of the pattern (e.g., "UUID Identifier Pattern")
- `{{ClassIndexIdentifier}}` - Hash identifier from class index (e.g., "a1b2c3d4e5f6")
- `{{FileName}}` - Source file name (e.g., "OrderId.kt")

### Coverage Summary Variables
- `{{LayerName}}` - Architecture layer name (e.g., "Domain Layer")
- `{{TotalValueObjectCount}}` - Total number of value objects analyzed
- `{{CategoryName}}` - Category name for coverage summary
- `{{ValueObjectCount}}` - Number of value objects in category
- `{{CoveragePercentage}}` - Percentage coverage for category

### File Analysis Variables
- `{{AnalyzedFiles}}` - List of all files that were analyzed
- `{{ClassIndexIdentifier}}` - Unique hash for file identification
- `{{FileName}}` - Name of the analyzed file

## Usage Instructions

### 1. Pattern Identification
For each value object pattern found in your analysis:
1. Assign a unique pattern ID following the format: `{{LayerPrefix}}-{{CategoryPrefix}}-{{Number}}`
   - Layer Prefix: "VO" for Value Object/Domain Layer
   - Category Prefix: "PRM" for Primitive wrappers, "CPX" for Complex value objects, "VAL" for Validation patterns, "CNV" for Conversion patterns, etc.
   - Number: Sequential numbering (01, 02, 03...)

2. Create descriptive pattern names that capture the essence of the value object pattern
3. Reference the source file using the class index identifier

### 2. Coverage Tracking
- Track total value objects analyzed per category
- Calculate coverage percentages
- List all analyzed files with their identifiers

### 3. Example Usage

```markdown
## Pattern Index

### Domain Layer - Primitive Wrappers Patterns
- **VO-PRM-01**: UUID Identifier Pattern - [a1b2c3d4e5f6] OrderId.kt
- **VO-PRM-02**: String Validation Pattern - [b2c3d4e5f6a1] EmailAddress.kt
- **VO-PRM-03**: Numeric Range Pattern - [c3d4e5f6a1b2] Price.kt

### Domain Layer - Complex Value Objects Patterns
- **VO-CPX-01**: Composite Value Pattern - [d4e5f6a1b2c3] Address.kt
- **VO-CPX-02**: Enumerated Value Pattern - [e5f6a1b2c3d4] OrderStatus.kt

### Coverage Summary
**Total Domain Layer Value Objects Analyzed**: 15
- **Primitive Wrappers**: 8 value objects (100% coverage)
- **Complex Value Objects**: 7 value objects (100% coverage)
```

### 4. Pattern Naming Conventions

#### Good Pattern Names
- ✅ **UUID Identifier Pattern** - Clear identification purpose
- ✅ **String Validation Pattern** - Describes validation responsibility
- ✅ **Numeric Range Pattern** - Common domain constraint pattern
- ✅ **Composite Value Pattern** - Describes structure and purpose

#### Bad Pattern Names
- ❌ **String Pattern** - Too generic
- ❌ **Data Pattern** - Vague and unhelpful
- ❌ **Helper Pattern** - Not describing value object purpose
- ❌ **Utility Pattern** - Should be domain-focused

### 5. Category Organization

#### Domain Layer Categories
- **Primitive Wrappers Patterns**: Simple value objects wrapping primitive types with validation
- **Complex Value Objects Patterns**: Multi-field value objects with complex validation
- **Validation Patterns**: Specific validation approaches and constraint handling
- **Conversion Patterns**: Value transformation and mapping patterns
- **Enumeration Patterns**: Enumerated values and type-safe constants

#### Pattern ID Prefixes
- `VO-PRM-XX`: Primitive wrappers (ID wrappers, string wrappers, numeric wrappers)
- `VO-CPX-XX`: Complex value objects (addresses, coordinates, composite values)
- `VO-VAL-XX`: Validation patterns (constraint validation, business rule validation)
- `VO-CNV-XX`: Conversion patterns (value transformation, format conversion)
- `VO-ENM-XX`: Enumeration patterns (type-safe enums, status values, categories)

### 6. Value Object Analysis Guidelines

#### What to Analyze
- **Immutability**: Data class structure, val properties, immutable design
- **Validation**: Constructor validation, business rule enforcement
- **Equality**: equals/hashCode implementation, value-based equality
- **Encapsulation**: Private validation methods, clean public interface
- **Conversion**: Factory methods, transformation utilities, format handling

#### Pattern Categories to Look For
1. **Primitive Wrapper Patterns**: How value objects wrap and validate primitive types
2. **Validation Patterns**: Different approaches to validation and constraint enforcement
3. **Composition Patterns**: How complex value objects are composed from simpler ones
4. **Conversion Patterns**: Value transformation and format conversion approaches
5. **Enumeration Patterns**: Type-safe enumeration and constant value patterns

#### Value Object Responsibilities
- **Encapsulation**: Wrapping primitive values with domain meaning
- **Validation**: Enforcing business rules and constraints
- **Immutability**: Ensuring value object instances cannot be modified
- **Equality**: Providing value-based equality semantics
- **Representation**: Converting to/from external formats (strings, primitives)

#### Common Value Object Types
- **Identifiers**: UUID wrappers, typed IDs, reference values
- **Measurements**: Money, quantities, coordinates, dimensions
- **Text Values**: Names, descriptions, emails, phone numbers
- **Enumerations**: Status values, categories, types, classifications
- **Composite Values**: Addresses, date ranges, complex structures

#### Anti-Patterns to Identify
- **Mutable Value Objects**: Value objects with var properties or mutable state
- **Missing Validation**: Value objects without proper constraint enforcement
- **Anemic Value Objects**: Value objects with only getters and no behavior
- **Technology Coupling**: Value objects dependent on specific frameworks
- **Poor Encapsulation**: Exposing internal validation logic or state

### 7. Template Completion Checklist

- [ ] All value object files analyzed and catalogued
- [ ] Pattern IDs assigned following naming convention
- [ ] Coverage percentages calculated per category
- [ ] Good/bad examples provided for major patterns
- [ ] Source references include class index identifiers
- [ ] Implementation guidelines completed for each pattern category
- [ ] Validation strategies documented
- [ ] Testing approaches specified
- [ ] Performance considerations addressed
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines