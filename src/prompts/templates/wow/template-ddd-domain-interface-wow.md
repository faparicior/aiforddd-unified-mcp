# 🎯 DDD Domain Layer - {{PackageName}} Package Domain Interfaces (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

> This document defines the Domain Interface (Port) patterns and guidelines for the `{{PackageName}}` package following DDD architectural principles.
>
> **Related templates**: `template-ddd-repository-wow.md` (Repository implementations) | `template-ddd-use-case-wow.md` (Use Cases) | `template-ddd-entity-wow.md` (Entities)

---

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
4. [🗂️ Interface Catalogue](#-interface-catalogue)
5. [📐 Core Patterns and Rules](#-core-patterns-and-rules)
6. [🔌 Dependency Inversion Strategy](#-dependency-inversion-strategy)
7. [✂️ Interface Segregation](#-interface-segregation)
8. [📍 Layer Placement Rules](#-layer-placement-rules)
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

**Domain Purpose:** {{DomainPurpose}}

**Architecture Layer:** Domain Layer - Domain Interfaces (Ports)

---

## 🏗️ Architecture Position

```
Domain Layer (Clients) → Domain Interface (Port) ← Infrastructure Layer (Adapters)
```

The `{{PackageName}}` domain interfaces define the contracts that higher layers depend on, enabling dependency inversion and making the domain/application layers independent of infrastructure choices.

### Package Structure Convention
_[Describe the package naming and organization pattern]_

Examples:
- _[Add 2-3 generic examples of package structure]_

---

## 📋 Architecture Rules

### 1. Layer Responsibility
- **Purpose**: {{LayerMainPurpose}} (contract-only, no implementation)
- **Allowed in signatures**: {{AllowedInSignatures}} (Domain objects, primitives, application types)
- **Forbidden in signatures**: {{ForbiddenInSignatures}} (Infrastructure types, framework annotations)
- **Restrictions**: {{LayerRestrictions}}

### 2. Naming Conventions
{{NamingConventionDescription}} (e.g., Repository suffix for data ports, Port/Gateway for external services)

### 3. Dependency Direction
{{DependencyDirectionDescription}} (Adapters depend on ports, never the reverse)

---

## 🗂️ Interface Catalogue

### Domain Layer Interfaces

| Interface | Layer | Responsibility | Implementations |
|-----------|-------|----------------|-----------------|
| {{Interface1}} | Domain Layer | {{Responsibility1}} | {{Implementations1}} |
| {{Interface2}} | Domain Layer | {{Responsibility2}} | {{Implementations2}} |


---

## 📐 Core Patterns and Rules

### Contract Definition Patterns

#### {{ContractCategoryName}}

**Total Patterns Found**: {{PatternCount}}

{{#ContractPatternRules}}
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

{{/ContractPatternRules}}

---

### Dependency Inversion Patterns

#### {{DIPatternCategoryName}}

{{#DIPatternRules}}
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

{{/DIPatternRules}}

---

## 🔌 Dependency Inversion Strategy

### Port Declaration Location
- **Repository Ports**: {{RepositoryPortLocation}} (Domain Layer)
- **External Service Ports**: {{ExternalServicePortLocation}} (Domain Layer)
- **Rationale**: {{DIPRationale}}

### Adapter Binding
- **Binding Mechanism**: {{AdapterBindingMechanism}} (e.g., DI container, qualifier annotations, module config)
- **Multiple Adapters**: {{MultipleAdapterStrategy}} (e.g., test double vs. real adapter)

**Example:**
```
{{DIExample}}
```

---

## ✂️ Interface Segregation

### Segregation Strategy
{{SegregationStrategyDescription}}

### Interface Granularity
- **Read Model Ports**: {{ReadModelPortStrategy}} (query-only interfaces)
- **Write Model Ports**: {{WriteModelPortStrategy}} (command interfaces)
- **Hybrid Ports**: {{HybridPortStrategy}}

**Example:**
```
{{SegregationExample}}
```

---

## 📍 Layer Placement Rules

### Domain Layer Placement
{{LayerPlacementDecisionRules}}

| Interface Type | Layer | Reason |
|---------------|-------|-------|
| {{InterfaceType1}} | Domain Layer | {{Reason1}} |
| {{InterfaceType2}} | Domain Layer | {{Reason2}} |
| {{InterfaceType3}} | Domain Layer | {{Reason3}} |

---

## 🛠️ Implementation Guidelines

### Method Signature Design
{{MethodSignatureGuidelines}}

### Generic Type Parameters
{{GenericTypeGuidelines}}

### Default Methods
{{DefaultMethodGuidelines}}

{{#ImplementationGuidelines}}
### {{GuidelineName}}
{{GuidelineDescription}}

{{/ImplementationGuidelines}}

---

## 🧪 Testing Approach

### Test Doubles
- **{{TestDoublePattern}}**: {{TestDoubleDescription}} (in-memory adapter vs. mock vs. fake)
- **Test Double Lifecycle**: {{TestDoubleLifecycle}}

### Interface Contract Tests
- **{{ContractTestPattern}}**: {{ContractTestDescription}}
- **Shared Contract Test**: {{SharedContractTestStrategy}}

### Interface Testing Rules

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
**Total Domain Layer Domain Interfaces Analyzed**: {{TotalInterfaceCount}}
{{#CoverageByCategory}}
- **{{CategoryName}}**: {{InterfaceCount}} domain interfaces ({{CoveragePercentage}}% coverage)
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

### Pattern Definition Variables
- `{{PatternCount}}` - Total number of patterns found
- `{{PatternId}}` - Unique pattern identifier (e.g., "DI-CON-01", "DI-DEP-01")
- `{{PatternName}}` - Descriptive name of the pattern
- `{{ClassIndexIdentifier}}` - Hash identifier from class index
- `{{FileName}}` - Source file name

### Domain Interface-Specific Variables
- `{{NamingConventionDescription}}` - Suffix conventions (Repository, Port, Gateway)
- `{{DependencyDirectionDescription}}` - How dependency inversion is enforced
- `{{RepositoryPortLocation}}` - Which layer owns repository ports
- `{{ExternalServicePortLocation}}` - Which layer owns external service ports
- `{{AdapterBindingMechanism}}` - How adapters are bound to ports
- `{{SegregationStrategyDescription}}` - How interfaces are split by responsibility
- `{{LayerPlacementDecisionRules}}` - Rules for Domain Layer port placement

### Coverage Summary Variables
- `{{TotalInterfaceCount}}` - Total number of domain interfaces analyzed
- `{{CoverageByCategory}}` - Array of coverage objects

### File Analysis Variables
- `{{AnalyzedFiles}}` - List of all files analyzed
- `{{AdjacentCollaborators}}` - List of adjacent collaborator files

## Usage Instructions

### 1. Interface Catalogue Analysis
- Group interfaces by Layer (Domain vs. Application)
- Map each interface to its known implementations
- Verify no infrastructure types in method signatures

### 2. Pattern ID Format
- `DI-CON-XX`: Contract definition and interface naming patterns
- `DI-DEP-XX`: Dependency inversion and layer boundary patterns
- `DI-IMP-XX`: Implementation contract and invariant patterns
- `DI-SEG-XX`: Interface naming and segregation patterns
- `DI-LYR-XX`: Layer placement and dependency direction patterns

### 3. Template Completion Checklist

- [ ] All domain interface files analyzed and catalogued
- [ ] Interface catalogue tables completed for both layers
- [ ] Dependency inversion strategy documented
- [ ] Interface segregation approach documented
- [ ] Layer placement rules documented
- [ ] Pattern IDs assigned following naming convention
- [ ] Good/bad examples provided for major patterns
- [ ] Test double strategy documented
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines
