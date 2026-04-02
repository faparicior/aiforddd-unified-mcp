# 🎯 DDD Domain Layer - {{PackageName}} Package Domain Services (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

> This document defines the Domain Service patterns and guidelines for the `{{PackageName}}` package following DDD architectural principles.
>
> **Related templates**: `template-ddd-use-case-wow.md` (Use Cases/Application Services) | `template-ddd-entity-wow.md` (Entities)

---

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
4. [📐 Core Patterns and Rules](#-core-patterns-and-rules)
5. [🔄 Service Responsibility Boundaries](#-service-responsibility-boundaries)
6. [🧩 Dependency & Port Patterns](#-dependency--port-patterns)
7. [📣 Domain Event Publishing](#-domain-event-publishing)
8. [🛠️ Implementation Guidelines](#-implementation-guidelines)
9. [⚠️ Error Handling Strategy](#-error-handling-strategy)
10. [🧪 Testing Approach](#-testing-approach)
11. [📝 Implementation Notes](#-implementation-notes)
12. [🚫 Anti-Patterns to Avoid](#-anti-patterns-to-avoid)
13. [Summary](#summary)
14. [Pattern Index](#pattern-index)
15. [❓ Open Questions](#-open-questions)

---

## 📌 Overview

**Package:** `{{PackageName}}`  
**Description:** {{PackageDescription}}  
**Responsibility:** {{PrimaryResponsibility}}

**Domain Purpose:** {{DomainPurpose}}

**Architecture Layer:** Domain Layer - Domain Services

---

## 🏗️ Architecture Position

```
Application Layer (Use Cases) → Domain Service ({{PackageName}}) → Domain Objects / Domain Interfaces
```

The `{{PackageName}}` domain services encapsulate business logic that spans multiple aggregates or doesn't fit naturally within a single entity, keeping the domain model cohesive and expressive.

### Package Structure Convention
_[Describe the package naming and organization pattern]_

Examples:
- _[Add 2-3 generic examples of package structure]_

---

## 📋 Architecture Rules

### 1. Layer Responsibility
- **Purpose**: {{LayerMainPurpose}}
- **Dependencies allowed**: {{AllowedDependencies}} (Domain objects, Domain interfaces, Domain events)
- **Restrictions**: {{LayerRestrictions}} (No direct infrastructure imports, no HTTP/persistence concerns)

### 2. Statelessness Requirement
{{StatelessnessDescription}}

### 3. Naming Conventions
{{NamingConventionDescription}}

---

## 📐 Core Patterns and Rules

### Categories Analyzed

| Category          | Description              |
|-------------------|--------------------------|
| **{{Category1}}** | {{CategoryDescription1}} |
| **{{Category2}}** | {{CategoryDescription2}} |

---

### Rules by Category

#### {{CategoryName}}

**Total Patterns Found**: {{PatternCount}}

{{#PatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**✅ GOOD - {{UseCasePatternDescription}}:**
```
{{GoodPatternExample}}
```
**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**Key Benefits:**
{{#Benefits}}
- **{{BenefitName}}**: {{BenefitDescription}}
{{/Benefits}}

**❌ BAD - {{UseCaseAntiPatternDescription}}:**
```
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}
- {{Reason}}
{{/AntiPatternReasons}}

{{/PatternRules}}

---

## 🔄 Service Responsibility Boundaries

### When to Use a Domain Service
{{WhenToUseDomainService}}

### When NOT to Use a Domain Service
{{WhenNotToUseDomainService}} (prefer entity/aggregate methods or application use cases)

### Domain Service vs. Application Service
| Concern | Domain Service | Application Service (Use Case) |
|---------|---------------|-------------------------------|
| Domain invariants | ✓ | ✗ |
| Cross-aggregate logic | ✓ | ✓ |
| Transaction boundary | ✗ | ✓ |
| Authorization | ✗ | ✓ |
| Persistence | ✗ (via port) | ✓ (via port) |
| DTO mapping | ✗ | ✓ |

### Responsibility Patterns
- **{{Responsibility1}}**: {{ResponsibilityDescription1}}
- **{{Responsibility2}}**: {{ResponsibilityDescription2}}

---

## 🧩 Dependency & Port Patterns

### Dependency Injection Strategy
- **Injection Type**: {{InjectionType}} (constructor / method parameter)
- **Port Naming**: {{PortNamingConvention}}
- **Infrastructure Avoidance**: {{InfrastructureAvoidanceStrategy}}

### Domain Interface (Port) Usage
{{DomainInterfaceUsageDescription}}

**Example:**
```
{{PortUsageExample}}
```

---

## 📣 Domain Event Publishing

### Event Publishing Strategy
- **Publisher Mechanism**: {{EventPublisherMechanism}} (constructor injection / static bus / aggregate list)
- **When Events Are Published**: {{WhenEventsArePublished}}
- **Event Construction**: {{EventConstructionPattern}}

**Example:**
```
{{EventPublishingExample}}
```

---

## 🛠️ Implementation Guidelines

### Constructor Design
{{ConstructorDesignGuidelines}}

### Method Design
{{MethodDesignGuidelines}}

### Guard Clauses
{{GuardClauseGuidelines}}

{{#ImplementationGuidelines}}
### {{GuidelineName}}
{{GuidelineDescription}}

{{/ImplementationGuidelines}}

---

## ⚠️ Error Handling Strategy

### Domain Exception Throwing
{{DomainExceptionThrowingStrategy}}

**Example:**
```
{{ExceptionExample}}
```

### Precondition Enforcement
{{PreconditionEnforcementStrategy}}

---

## 🧪 Testing Approach

### Unit Testing
- **{{UnitTestPattern}}**: {{UnitTestDescription}}
- **Mock Strategy**: {{MockStrategy}} (mock domain interfaces, use real domain objects)
- **Coverage Target**: {{CoverageTarget}}

### Service Testing Rules

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

## 📝 Implementation Notes

{{#ImplementationNotes}}
### {{ImplementationNoteName}}
{{ImplementationNoteDescription}}

{{/ImplementationNotes}}

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
**Total Domain Layer Domain Services Analyzed**: {{TotalInterfaceCount}}
{{#CoverageByCategory}}
- **{{CategoryName}}**: {{InterfaceCount}} domain services ({{CoveragePercentage}}% coverage)
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
- `{{PatternCount}}` - Total number of patterns found in analysis
- `{{PatternRules}}` - Array of core pattern rule objects
- `{{PatternCategories}}` - Array of pattern category objects with nested patterns
- `{{PatternId}}` - Unique pattern identifier (e.g., "DS-RSP-01", "DS-OPS-01")
- `{{PatternName}}` - Descriptive name of the pattern
- `{{ClassIndexIdentifier}}` - Hash identifier from class index
- `{{FileName}}` - Source file name
- `{{Benefits}}` - Array of benefit objects
- `{{AntiPatternReasons}}` - Array of reason strings
- `{{SourceFiles}}` - Array of source file objects

### Domain Service-Specific Variables
- `{{StatelessnessDescription}}` - How statelessness is enforced
- `{{WhenToUseDomainService}}` - Criteria for creating a domain service
- `{{WhenNotToUseDomainService}}` - When entity methods or use cases are better
- `{{InjectionType}}` - Constructor or method parameter injection
- `{{EventPublisherMechanism}}` - How events are dispatched

### Coverage Summary Variables
- `{{TotalInterfaceCount}}` - Total number of domain services analyzed
- `{{CoverageByCategory}}` - Array of coverage objects

### File Analysis Variables
- `{{AnalyzedFiles}}` - List of all files analyzed
- `{{AdjacentCollaborators}}` - List of adjacent collaborator files

## Usage Instructions

### 1. Domain Service Analysis
- Verify each class is truly stateless and domain-scoped
- Map dependencies to domain interfaces (ports), not concrete implementations
- Identify which aggregates/entities the service operates on
- Document domain events published, if any

### 2. Pattern ID Format
- `DS-RSP-XX`: Service responsibility and statelessness patterns
- `DS-OPS-XX`: Domain operation and cross-aggregate orchestration patterns
- `DS-DEP-XX`: Dependency injection and port usage patterns
- `DS-EVT-XX`: Domain event publishing patterns
- `DS-ERR-XX`: Error propagation and guard clause patterns

### 3. Domain Service vs. Application Service Checklist
- [ ] Service has no persistence calls (only via domain interfaces)
- [ ] Service is stateless (no instance fields other than injected ports)
- [ ] Method names reflect domain language (not CRUD verbs)
- [ ] No DTO mapping, no auth concerns — those belong in Use Case

### 4. Template Completion Checklist

- [ ] All domain service files analyzed and catalogued
- [ ] Statelessness verified for each service
- [ ] Service responsibility boundary section completed
- [ ] Dependency injection pattern documented
- [ ] Pattern IDs assigned following naming convention
- [ ] Good/bad examples provided for major patterns
- [ ] Domain event publishing documented when present
- [ ] Testing approaches specified
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines
