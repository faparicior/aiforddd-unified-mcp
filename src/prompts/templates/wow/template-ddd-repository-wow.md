# 🎯 DDD Infrastructure Layer - Repositories - {{PackageName}} Package (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

> This document defines the Repository implementation patterns and guidelines for the `{{PackageName}}` package following DDD architectural principles (Ports & Adapters / Hexagonal Architecture).
>
> **Related templates**: `template-ddd-event-producer-wow.md` | `template-ddd-api-client-wow.md`

---

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#-architecture-position)
3. [📐 Core Patterns and Rules](#-core-patterns-and-rules)
4. [🔄 Aggregate Reconstruction Pattern](#-aggregate-reconstruction-pattern)
5. [🔍 Query Builder Patterns](#-query-builder-patterns)
6. [💱 Transaction Management](#-transaction-management)
7. [📖 Projection / Read Model Patterns](#-projection--read-model-patterns)
8. [🛠️ Implementation Guidelines](#-implementation-guidelines)
9. [⚠️ Error Handling Strategy](#-error-handling-strategy)
10. [🧪 Testing Approach](#-testing-approach)
11. [⚡ Performance Considerations](#-performance-considerations)
12. [🔒 Security Guidelines](#-security-guidelines)
13. [📝 Implementation Notes](#-implementation-notes)
14. [🚫 Anti-Patterns to Avoid](#-anti-patterns-to-avoid)
15. [Summary](#summary)
16. [Pattern Index](#pattern-index)
17. [❓ Open Questions](#-open-questions)

---

## 📌 Overview

**Package:** `{{PackageName}}`  
**Description:** {{PackageDescription}}  
**Responsibility:** {{PrimaryResponsibility}}

**Domain Purpose:** {{DomainPurpose}}

**Architecture Layer:** Infrastructure Layer - Repositories  
**Port Implemented:** `{{RepositoryPortInterface}}` _(defined in domain/application layer)_

---

## 🏗️ Architecture Position

```
Application Layer (Port: {{RepositoryPortInterface}}) → Repository Implementation ({{PackageName}}) → {{DatabaseTechnology}}
```

The `{{PackageName}}` repositories are adapters that implement repository ports defined in the domain/application layer. They translate between domain aggregates and the persistence model, keeping all infrastructure concerns out of the domain.

### Package Structure Convention
_[Describe the package naming and organization pattern]_

Examples:
- _[Add 2-3 generic examples of package structure]_

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
```kotlin
{{GoodPatternExample}}
```
**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**Key Benefits:**
{{#Benefits}}
- **{{BenefitName}}**: {{BenefitDescription}}
{{/Benefits}}

**❌ BAD - {{UseCaseAntiPatternDescription}}:**
```kotlin
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}
- {{Reason}}
{{/AntiPatternReasons}}

{{/PatternRules}}

---

## 🔄 Aggregate Reconstruction Pattern

### Persistence Model to Domain Model Mapping
- **Mapping Strategy**: {{MappingStrategy}} (e.g., ORM annotations, mapper class, factory method)
- **Value Object Reconstruction**: {{ValueObjectReconstructionStrategy}}
- **Association Loading**: {{AssociationLoadingStrategy}} (e.g., eager, lazy, explicit join)
- **Invariant Preservation**: {{InvariantPreservationApproach}}

{{#AggregateReconstructionRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**✅ GOOD - {{PatternDescription}}:**
```kotlin
{{GoodPatternExample}}
```
**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**❌ BAD - {{AntiPatternDescription}}:**
```kotlin
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}
- {{Reason}}
{{/AntiPatternReasons}}

{{/AggregateReconstructionRules}}

---

## 🔍 Query Builder Patterns

### Query Strategy
- **Query Mechanism**: {{QueryMechanism}} (e.g., JPQL, QueryDSL, jOOQ, raw SQL, Spring Data)
- **Dynamic Filtering**: {{DynamicFilteringStrategy}}
- **Pagination Strategy**: {{PaginationStrategy}}
- **Sorting Strategy**: {{SortingStrategy}}

{{#QueryPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**✅ GOOD - {{PatternDescription}}:**
```kotlin
{{GoodPatternExample}}
```
**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**❌ BAD - {{AntiPatternDescription}}:**
```kotlin
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}
- {{Reason}}
{{/AntiPatternReasons}}

{{/QueryPatternRules}}

---

## 💱 Transaction Management

### Transaction Strategy
- **Transaction Boundary**: {{TransactionBoundary}} (e.g., use case, repository method)
- **Propagation**: {{TransactionPropagation}}
- **Isolation Level**: {{IsolationLevel}}
- **Optimistic Locking**: {{OptimisticLockingStrategy}}
- **Pessimistic Locking**: {{PessimisticLockingUseCase}}

**Example:**
```kotlin
{{TransactionExample}}
```

---

## 📖 Projection / Read Model Patterns

### Read Model Strategy
- **Read vs Write Model**: {{ReadWriteModelSeparation}}
- **Projection Technology**: {{ProjectionTechnology}} (e.g., separate query, materialized view, CQRS read side)
- **Staleness Tolerance**: {{StalenessTolerance}}

{{#ProjectionPatternRules}}
##### Rule {{RuleId}}: {{PatternName}} Pattern

**✅ GOOD - {{PatternDescription}}:**
```kotlin
{{GoodPatternExample}}
```
**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**❌ BAD - {{AntiPatternDescription}}:**
```kotlin
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}
- {{Reason}}
{{/AntiPatternReasons}}

{{/ProjectionPatternRules}}

---

## 🛠️ Implementation Guidelines

### Dependency Injection
- **{{DIPattern}}**: {{DIDescription}}
- **Configuration**: {{ConfigurationApproach}}
- **Connection Pool**: {{ConnectionPoolStrategy}}

### Port Implementation Rules
- **Interface Compliance**: {{InterfaceComplianceDescription}}
- **No Domain Leakage**: {{NoDomainLeakageDescription}}

{{#ImplementationGuidelines}}
### {{GuidelineName}}
{{GuidelineDescription}}

{{/ImplementationGuidelines}}

---

## ⚠️ Error Handling Strategy

### Infrastructure Exception Translation
{{InfrastructureExceptionTranslation}}

**Example:**
```kotlin
{{ExceptionTranslationExample}}
```

### Optimistic Lock Conflict Handling
{{OptimisticLockConflictHandling}}

### {{ErrorLoggingPattern}}
{{ErrorLoggingDescription}}

---

## 🧪 Testing Approach

### Unit Testing (In-Memory Fake Repository)
- **{{UnitTestPattern}}**: {{UnitTestDescription}}
- **Fake Strategy**: {{FakeRepositoryStrategy}}
- **Coverage Target**: {{CoverageTarget}}

### Integration Testing (Testcontainers / Embedded DB)
- **{{IntegrationTestPattern}}**: {{IntegrationTestDescription}}
- **Test Environment**: {{TestEnvironment}} (e.g., Testcontainers PostgreSQL, H2)
- **Data Setup**: {{DataSetupStrategy}}

### Repository Testing Rules

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

### N+1 Query Prevention
- **{{NPlus1Pattern}}**: {{NPlus1Description}}

### Index Strategy
- **{{IndexStrategy}}**: {{IndexStrategyDescription}}

### Connection Pool Tuning
- **{{ConnectionPoolPattern}}**: {{ConnectionPoolDescription}}

{{#PerformancePatterns}}
### {{PerformancePatternName}}
{{PerformancePatternDescription}}

{{/PerformancePatterns}}

---

## 🔒 Security Guidelines

### SQL Injection Prevention
- **{{SqlInjectionPattern}}**: {{SqlInjectionDescription}}
- **Parameterized Queries**: {{ParameterizedQueryStrategy}}
- **ORM Usage**: {{OrmSecurityStrategy}}

### Connection Security
- **{{ConnectionSecurityPattern}}**: {{ConnectionSecurityDescription}}
- **Credentials Management**: {{CredentialsManagementStrategy}}

### Data Access Control
- **{{AccessControlPattern}}**: {{AccessControlDescription}}

{{#SecurityPatterns}}
### {{SecurityPatternName}}
{{SecurityPatternDescription}}

{{/SecurityPatterns}}

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
**Total Infrastructure Repositories Analyzed**: {{TotalInterfaceCount}}
{{#CoverageByCategory}}
- **{{CategoryName}}**: {{InterfaceCount}} repositories ({{CoveragePercentage}}% coverage)
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

Use @context/templates/ai-development/ai-definitions/ddd-discovery/definition-template-generic-id-management-guidelines.md for pattern ID management.

## Template Variables Reference

### Pattern Definition Variables
- `{{PatternCount}}` - Total number of patterns found in analysis
- `{{PatternRules}}` - Array of core pattern rule objects
- `{{AggregateReconstructionRules}}` - Array of aggregate reconstruction pattern rules
- `{{QueryPatternRules}}` - Array of query builder pattern rules
- `{{ProjectionPatternRules}}` - Array of projection/read model pattern rules
- `{{PatternCategories}}` - Array of pattern category objects with nested patterns
- `{{PatternId}}` - Unique pattern identifier (e.g., "REP-AGG-01", "REP-QRY-01")
- `{{PatternName}}` - Descriptive name of the pattern
- `{{ClassIndexIdentifier}}` - Hash identifier from class index (e.g., "a1b2c3d4e5f6")
- `{{FileName}}` - Source file name (e.g., "JpaOrderRepository.kt")
- `{{Benefits}}` - Array of benefit objects with BenefitName and BenefitDescription
- `{{AntiPatternReasons}}` - Array of reason strings for anti-pattern explanations
- `{{SourceFiles}}` - Array of source file objects with ClassIndexIdentifier and FileName

### Repository-Specific Variables
- `{{RepositoryPortInterface}}` - Name of the port interface this repository implements (e.g., "OrderRepository")
- `{{DatabaseTechnology}}` - Underlying storage (e.g., "PostgreSQL", "MongoDB", "Redis")
- `{{QueryMechanism}}` - Query approach (e.g., "JPQL", "QueryDSL", "Spring Data")
- `{{TransactionBoundary}}` - Where transactions are managed
- `{{MappingStrategy}}` - How domain objects map to persistence model
- `{{IsolationLevel}}` - Database isolation level used

### Coverage Summary Variables
- `{{TotalInterfaceCount}}` - Total number of repositories analyzed
- `{{CoverageByCategory}}` - Array of coverage objects with CategoryName, InterfaceCount, and CoveragePercentage

### File Analysis Variables
- `{{AnalyzedFiles}}` - List of all files that were analyzed
- `{{ClassIndexIdentifier}}` - Unique hash for file identification
- `{{FileName}}` - Name of the analyzed file

## Usage Instructions

### 1. Pattern Identification
For each repository pattern found in your analysis:
1. Assign a unique pattern ID following the format: `REP-{{CategoryPrefix}}-{{Number}}`
   - `REP-AGG-XX`: Aggregate reconstruction and mapping patterns
   - `REP-QRY-XX`: Query builder and data retrieval patterns
   - `REP-TXN-XX`: Transaction management patterns
   - `REP-PRJ-XX`: Projection and read model patterns
   - `REP-ERR-XX`: Infrastructure exception translation patterns

2. Create descriptive pattern names that capture the architectural intent
3. Reference the source file using the class index identifier

### 2. What to Analyze
- **Port Implementation**: How the repository implements the domain port interface
- **Persistence Model Separation**: Whether entity/table models are separate from domain aggregates
- **Aggregate Mapping**: How persistence entities are converted to/from domain aggregates
- **Query Construction**: Use of parameterized queries, ORM, or query builders
- **Transaction Boundaries**: Where `@Transactional` is placed and why
- **Exception Translation**: How DB exceptions are translated to domain exceptions

### 3. Pattern Naming Conventions

#### Good Pattern Names
- ✅ **Dedicated Mapper Aggregate Reconstruction Pattern** - Describes mapping approach
- ✅ **Parameterized Query Builder Pattern** - Describes SQL injection-safe queries
- ✅ **Use Case Transaction Boundary Pattern** - Describes where transactions live
- ✅ **Infrastructure Exception Translation Pattern** - Describes domain isolation

#### Bad Pattern Names
- ❌ **JPA Repository Pattern** - Too technology-specific
- ❌ **Database Pattern** - Too generic
- ❌ **Save Pattern** - Vague

### 4. Repository Analysis Guidelines

#### What to Look For
- **Port Compliance**: Repository class must implement the domain port interface exactly
- **No Domain Logic**: Repositories must never implement business rules
- **Persistence Model Isolation**: ORM annotations must not appear on domain aggregates
- **Parameterized Queries Only**: String concatenation in queries is a SQL injection risk
- **Exception Wrapping**: DB exceptions must be caught and re-thrown as domain exceptions

#### Anti-Patterns to Identify
- **Anemic Domain Mapping**: Returning raw DB records/entities to the application layer
- **Business Logic in Repository**: Query methods encoding business rules (e.g., `findActiveOrdersOlderThan30Days`)
- **Domain Aggregate as ORM Entity**: `@Entity` annotations on domain aggregates
- **String-Concatenated Queries**: Dynamic SQL built via string concatenation
- **Fat Repository**: Single repository handling multiple aggregates

### 5. Template Completion Checklist

- [ ] All repository files analyzed and catalogued
- [ ] Port interface identified for each repository
- [ ] Pattern IDs assigned following `REP-XX-XX` convention
- [ ] Aggregate reconstruction approach documented
- [ ] Persistence model vs. domain model separation documented
- [ ] Query building strategy documented
- [ ] Transaction boundary strategy documented
- [ ] Projection/read model patterns documented if applicable
- [ ] Good/bad examples provided for major patterns
- [ ] Source references include class index identifiers
- [ ] Security section completed (SQL injection, credentials, access control)
- [ ] Testcontainers / in-memory fake testing approach described
- [ ] Performance (N+1, indexing, connection pool) addressed
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines
