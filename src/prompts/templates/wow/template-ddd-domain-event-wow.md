# 🎯 DDD Domain Layer - {{PackageName}} Package Domain Events (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

> This document defines the Domain Event patterns and guidelines for the `{{PackageName}}` package following DDD architectural principles.
>
> **Related templates**: `template-ddd-integration-event-wow.md` (Integration Events) | `template-ddd-entity-wow.md` (Entities/Aggregates) | `template-ddd-event-consumer-wow.md` (Event Consumers)

---

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
4. [🗂️ Event Hierarchy](#-event-hierarchy)
5. [📐 Core Patterns and Rules](#-core-patterns-and-rules)
6. [📣 Event Publishing Strategy](#-event-publishing-strategy)
7. [👂 Event Handling Strategy](#-event-handling-strategy)
8. [🔄 Event Versioning & Evolution](#-event-versioning--evolution)
9. [💾 Event Serialization](#-event-serialization)
10. [🛠️ Implementation Guidelines](#-implementation-guidelines)
11. [🧪 Testing Approach](#-testing-approach)
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

**Architecture Layer:** Domain Layer - Domain Events

---

## 🏗️ Architecture Position

```
Domain Object (Aggregate/Service) → raises → Domain Event ({{PackageName}}) → dispatched to → Application Layer Handlers
```

The `{{PackageName}}` domain events capture facts that happened in the domain, decoupling the source aggregate from downstream reactions while preserving domain language.

### Package Structure Convention
_[Describe the package naming and organization pattern]_

Examples:
- _[Add 2-3 generic examples of package structure]_

---

## 📋 Architecture Rules

### 1. Layer Responsibility
- **Purpose**: {{LayerMainPurpose}}
- **Immutability**: {{ImmutabilityPolicy}} (all fields set once at construction)
- **Restrictions**: {{LayerRestrictions}} (no behavior, no infrastructure imports)

### 2. Naming Conventions
{{NamingConventionDescription}} (past-tense verbs: OrderPlaced, UserRegistered, PaymentProcessed)

### 3. Event Ownership
{{EventOwnershipDescription}} (which aggregate/service is responsible for raising each event)

---

## 🗂️ Event Hierarchy

### Base Classes

| Base Class | Description |
|-----------|-------------|
| {{BaseClass1}} | {{BaseClass1Description}} |
| {{BaseClass2}} | {{BaseClass2Description}} |

### Hierarchy Diagram

```
{{EventHierarchyDiagram}}
```

---

## 📐 Core Patterns and Rules

### Event Structure Patterns

#### {{StructureCategoryName}}

**Total Patterns Found**: {{PatternCount}}

{{#StructurePatternRules}}
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

{{/StructurePatternRules}}

---

### Event Publishing Patterns

#### {{PublishingCategoryName}}

{{#PublishingPatternRules}}
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

{{/PublishingPatternRules}}

---

## 📣 Event Publishing Strategy

### Publishing Mechanism
- **Mechanism**: {{PublishingMechanism}} (e.g., domain event list on aggregate, direct dispatcher injection, static bus)
- **Dispatch Timing**: {{DispatchTiming}} (eager / deferred / transactional outbox)
- **Publisher Abstraction**: {{PublisherAbstraction}}

### Aggregate Integration
{{AggregateIntegrationDescription}}

**Example:**
```
{{PublishingExample}}
```

---

## 👂 Event Handling Strategy

### Handler Registration
- **Registration Mechanism**: {{HandlerRegistrationMechanism}} (annotation, configuration, convention)
- **Handler Naming**: {{HandlerNamingConvention}}
- **Isolation**: {{HandlerIsolation}} (one handler per event type vs. shared dispatcher)

### Transaction Boundaries
{{TransactionBoundaryDescription}}

**Example:**
```
{{HandlerExample}}
```

---

## 🔄 Event Versioning & Evolution

### Versioning Strategy
- **Version Field**: {{VersionFieldPresence}} (Yes/No — field name: {{VersionFieldName}})
- **Backward Compatibility Rules**: {{BackwardCompatibilityRules}}
- **Breaking Change Protocol**: {{BreakingChangeProtocol}}

### Migration & Deprecation
{{MigrationDeprecationStrategy}}

**Example:**
```
{{VersioningExample}}
```

---

## 💾 Event Serialization

### Serialization Approach
- **Serializer**: {{SerializerFramework}} (e.g., Jackson, Gson, kotlinx.serialization)
- **Format**: {{SerializationFormat}} (JSON / Avro / Protobuf)
- **Custom Serializers**: {{CustomSerializerUsage}}

### Sealed Class / Union Types
{{SealedClassStrategy}}

**Example:**
```
{{SerializationExample}}
```

---

## 🛠️ Implementation Guidelines

### Event Construction
{{EventConstructionGuidelines}}

### Metadata Fields
{{MetadataFieldGuidelines}} (eventId, occurredAt, aggregateId, aggregateVersion)

### Value Objects in Events
{{ValueObjectInEventGuidelines}}

{{#ImplementationGuidelines}}
### {{GuidelineName}}
{{GuidelineDescription}}

{{/ImplementationGuidelines}}

---

## 🧪 Testing Approach

### Unit Testing
- **{{UnitTestPattern}}**: {{UnitTestDescription}}
- **Mock Strategy**: {{MockStrategy}}
- **Coverage Target**: {{CoverageTarget}}

### Event Testing Rules

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
**Total Domain Layer Domain Events Analyzed**: {{TotalInterfaceCount}}
{{#CoverageByCategory}}
- **{{CategoryName}}**: {{InterfaceCount}} domain events ({{CoveragePercentage}}% coverage)
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
- `{{PatternId}}` - Unique pattern identifier (e.g., "DE-STR-01", "DE-PUB-01")
- `{{PatternName}}` - Descriptive name of the pattern
- `{{ClassIndexIdentifier}}` - Hash identifier from class index
- `{{FileName}}` - Source file name

### Domain Event-Specific Variables
- `{{ImmutabilityPolicy}}` - How immutability is enforced
- `{{NamingConventionDescription}}` - Past-tense naming rules
- `{{EventOwnershipDescription}}` - Which aggregates own which events
- `{{PublishingMechanism}}` - How events are dispatched
- `{{DispatchTiming}}` - Eager / deferred / transactional outbox
- `{{VersionFieldPresence}}` - Whether events carry version fields
- `{{BackwardCompatibilityRules}}` - Rules for safe evolution
- `{{SerializerFramework}}` - Serialization technology used

### Coverage Summary Variables
- `{{TotalInterfaceCount}}` - Total number of domain events analyzed
- `{{CoverageByCategory}}` - Array of coverage objects

### File Analysis Variables
- `{{AnalyzedFiles}}` - List of all files analyzed
- `{{AdjacentCollaborators}}` - List of adjacent collaborator files

## Usage Instructions

### 1. Domain Event Analysis
- Confirm immutability of all event fields
- Map each event to the aggregate or service that raises it
- Document dispatch mechanism and timing
- Identify handlers in the Application Layer

### 2. Pattern ID Format
- `DE-STR-XX`: Event structure and immutability patterns
- `DE-PUB-XX`: Event publishing and dispatch patterns
- `DE-HND-XX`: Event handling and subscription patterns
- `DE-EVO-XX`: Event versioning and evolution patterns
- `DE-SER-XX`: Event serialization and persistence patterns

### 3. Template Completion Checklist

- [ ] All domain event files analyzed and catalogued
- [ ] Event hierarchy diagram completed
- [ ] Immutability enforcement documented
- [ ] Publishing mechanism documented
- [ ] Handler registration approach documented
- [ ] Pattern IDs assigned following naming convention
- [ ] Good/bad examples provided for major patterns
- [ ] Versioning and evolution strategy documented
- [ ] Testing approaches specified
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines
