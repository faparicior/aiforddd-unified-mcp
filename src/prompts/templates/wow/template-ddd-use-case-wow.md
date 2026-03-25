# 🎯 DDD Application Layer - {{PackageName}} Package (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#️-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
    - [Layer Responsibility](#1-layer-responsibility)
    - [Package Structure Convention](#2-package-structure-convention)
4. [📐 Command Patterns](#-command-patterns)
5. [🔄 Use Case Patterns](#-use-case-patterns)
6. [🛠️ Implementation Guidelines](#️-implementation-guidelines)
7. [⚠️ Error Handling Strategy](#️-error-handling-strategy)
8. [🧪 Testing Approach](#-testing-approach)
9. [⚡ Performance Considerations](#-performance-considerations)
10. [🚫 Anti-Patterns to Avoid](#-anti-patterns-to-avoid)
11. [Summary](#summary)
12. [Pattern Index](#pattern-index)
13. [❓ Open Questions](#-open-questions)

## 📌 Overview

**Package:** `{{PackageName}}`  
**Description:** {{PackageDescription}}  
**Responsibility:** {{PrimaryResponsibility}}

**Domain Purpose:** {{DomainPurpose}}

**Architecture Layer:** Application Layer - {{SpecificApplicationLayer}}

## 🏗️ Architecture Position

```
{{ExternalSystems}} → UI Layer ({{PackageName}}) → Application Layer ({{ApplicationComponents}}) → Domain Layer
```

The `{{PackageName}}` layer sits at the system boundary, {{ArchitectureDescription}} while maintaining proper separation of concerns and {{SpecificConcerns}}.

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

## 📐 Command Patterns

### Command rules by Category

#### {{CommandCategoryName}}

{{#CommandPatternRules}}
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

{{/CommandPatternRules}}

## 🔄 Use Case Patterns

### Use case rules by Category

#### {{UseCaseCategoryName}}

{{#UseCasePatternRules}}
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

{{/UseCasePatternRules}}

---

## 🛠️ Implementation Guidelines

### Dependency Injection
- **{{DIPattern}}**: {{DIDescription}}
- **Configuration**: {{ConfigurationApproach}}
- **Lifecycle**: {{LifecycleManagement}}

{{#ImplementationGuidelines}}
### {{GuidelineName}}
{{GuidelineDescription}}

{{/ImplementationGuidelines}}

---

## ⚠️ Error Handling Strategy

{{#ErrorHandlingPatterns}}
### {{ErrorHandlingPatternName}}
{{ErrorHandlingPatternDescription}}

**Example:**
```
{{ErrorHandlingExample}}
```

{{/ErrorHandlingPatterns}}

---

## 🧪 Testing Approach

### Unit Testing
- **{{UnitTestPattern}}**: {{UnitTestDescription}}
- **Mock Strategy**: {{MockStrategy}}
- **Coverage Target**: {{CoverageTarget}}

### Integration Testing
- **{{IntegrationTestPattern}}**: {{IntegrationTestDescription}}
- **Test Environment**: {{TestEnvironment}}
- **Data Setup**: {{DataSetupStrategy}}

### Use Case Testing Rules

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
**Total {{LayerName}} Use Cases Analyzed**: {{TotalUseCaseCount}}
{{#CoverageByCategory}}
- **{{CategoryName}}**: {{UseCaseCount}} use cases ({{CoveragePercentage}}% coverage)
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
- `{{ApplicationCategory1Name}}` - Name of first use case pattern category (e.g., "Application Layer - Command Operations")
- `{{ApplicationCategory2Name}}` - Name of second use case pattern category (e.g., "Application Layer - Query Operations")
- `{{PatternId}}` - Unique pattern identifier (e.g., "UC-CMD-01", "UC-QRY-01")
- `{{PatternName}}` - Descriptive name of the pattern (e.g., "Domain Orchestration Pattern")
- `{{ClassIndexIdentifier}}` - Hash identifier from class index (e.g., "a1b2c3d4e5f6")
- `{{FileName}}` - Source file name (e.g., "CreateOrderUseCase.ext")

### Coverage Summary Variables
- `{{LayerName}}` - Architecture layer name (e.g., "Application Layer")
- `{{TotalUseCaseCount}}` - Total number of use cases analyzed
- `{{CategoryName}}` - Category name for coverage summary
- `{{UseCaseCount}}` - Number of use cases in category
- `{{CoveragePercentage}}` - Percentage coverage for category

### File Analysis Variables
- `{{AnalyzedFiles}}` - List of all files that were analyzed
- `{{ClassIndexIdentifier}}` - Unique hash for file identification
- `{{FileName}}` - Name of the analyzed file

## Usage Instructions

### 1. Pattern Identification
For each use case pattern found in your analysis:
1. Assign a unique pattern ID following the format: `{{LayerPrefix}}-{{CategoryPrefix}}-{{Number}}`
    - Layer Prefix: "UC" for Use Case/Application Layer
    - Category Prefix: "CMD" for Command operations, "QRY" for Query operations, "ORD" for Orchestration, "VAL" for Validation, etc.
    - Number: Sequential numbering (01, 02, 03...)

2. Create descriptive pattern names that capture the essence of the use case pattern
3. Reference the source file using the class index identifier

### 2. Coverage Tracking
- Track total use cases analyzed per category
- Calculate coverage percentages
- List all analyzed files with their identifiers

### 3. Example Usage

```markdown
## Pattern Index

### Application Layer - Command Operations Patterns
- **UC-CMD-01**: Domain Orchestration Pattern - [a1b2c3d4e5f6] CreateOrderUseCase.ext
- **UC-CMD-02**: Transaction Boundary Pattern - [b2c3d4e5f6a1] ProcessPaymentUseCase.kt
- **UC-CMD-03**: State Validation Pattern - [c3d4e5f6a1b2] UpdateOrderUseCase.kt

### Application Layer - Query Operations Patterns
- **UC-QRY-01**: Repository Coordination Pattern - [d4e5f6a1b2c3] FindOrderUseCase.kt
- **UC-QRY-02**: Data Aggregation Pattern - [e5f6a1b2c3d4] GetOrderSummaryUseCase.kt

### Coverage Summary
**Total Application Layer Use Cases Analyzed**: 12
- **Command Operations**: 8 use cases (100% coverage)
- **Query Operations**: 4 use cases (100% coverage)
```

### 4. Pattern Naming Conventions

#### Good Pattern Names
- ✅ **Domain Orchestration Pattern** - Clear architectural intent
- ✅ **Transaction Boundary Pattern** - Describes application layer responsibility
- ✅ **State Validation Pattern** - Common validation pattern
- ✅ **Repository Coordination Pattern** - Describes data access orchestration

#### Bad Pattern Names
- ❌ **Service Pattern** - Too generic
- ❌ **Database Pattern** - Too technology-specific
- ❌ **Helper Pattern** - Vague and unhelpful
- ❌ **Business Logic Pattern** - Should be in domain layer

### 5. Category Organization

#### Application Layer Categories
- **Command Operations Patterns**: Create, Update, Delete operations and their orchestration
- **Query Operations Patterns**: Read operations, data retrieval, and aggregation
- **Orchestration Patterns**: Complex business process coordination
- **Validation Patterns**: Input validation, business rule validation
- **Integration Patterns**: External service integration, event handling

#### Pattern ID Prefixes
- `UC-CMD-XX`: Command operations (create, update, delete use cases)
- `UC-QRY-XX`: Query operations (find, get, search use cases)
- `UC-ORD-XX`: Orchestration (complex multi-step business processes)
- `UC-VAL-XX`: Validation (input validation, business rule validation)
- `UC-INT-XX`: Integration (external service calls, event processing)

### 6. Use Case Analysis Guidelines

#### What to Analyze
- **Use Case Structure**: Service annotations, dependency injection patterns
- **Transaction Management**: Transaction annotation/decorator usage, transaction boundary patterns
- **Domain Interaction**: How use cases orchestrate domain operations
- **Error Handling**: Exception handling patterns, validation approaches
- **Repository Usage**: Data access patterns, repository coordination

#### Pattern Categories to Look For
1. **Orchestration Patterns**: How use cases coordinate domain operations
2. **Transaction Patterns**: Transaction boundary management
3. **Validation Patterns**: Input validation and business rule enforcement
4. **Error Handling Patterns**: Exception handling and error recovery
5. **Integration Patterns**: External service integration approaches

### 7. Template Completion Checklist

- [ ] All use case files analyzed and catalogued
- [ ] Pattern IDs assigned following naming convention
- [ ] Coverage percentages calculated per category
- [ ] Good/bad examples provided for major patterns
- [ ] Source references include class index identifiers
- [ ] Implementation guidelines completed for each pattern category
- [ ] Error handling strategies documented
- [ ] Testing approaches specified
- [ ] Performance considerations addressed
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines