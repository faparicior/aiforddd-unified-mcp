# 🎯 DDD UI Layer - {{PackageName}} Package (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

> This document defines the UI layer patterns and guidelines for the `{{PackageName}}` package following DDD architectural principles.

---

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#-architecture-position)
3. [📐 Core Patterns and Rules](#-core-patterns-and-rules)
4. [🛠️ Implementation Guidelines](#-implementation-guidelines)
5. [⚠️ Error Handling Strategy](#-error-handling-strategy)
6. [🧪 Testing Approach](#-testing-approach)
7. [⚡ Performance Considerations](#-performance-considerations)
8. [🔒 Security Guidelines](#-security-guidelines)
9. [📝 Implementation Notes](#-implementation-notes)
10. [🚫 Anti-Patterns to Avoid](#-anti-patterns-to-avoid)
11. [Summary](#summary)
12. [Pattern Index](#pattern-index)
13. [❓ Open Questions](#-open-questions)

---

## 📌 Overview

**Package:** `{{PackageName}}`  
**Description:** {{PackageDescription}}  
**Responsibility:** {{PrimaryResponsibility}}

**Domain Purpose:** {{DomainPurpose}}

**Architecture Layer:** UI Layer - {{SpecificUILayer}}

---

## 🏗️ Architecture Position

```
{{ExternalSystems}} → UI Layer ({{PackageName}}) → Application Layer ({{ApplicationComponents}}) → Domain Layer
```

The `{{PackageName}}` layer sits at the system boundary, {{ArchitectureDescription}} while maintaining proper separation of concerns and {{SpecificConcerns}}.

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

### Integration Testing
- **{{IntegrationTestPattern}}**: {{IntegrationTestDescription}}
- **Test Environment**: {{TestEnvironment}}
- **Data Setup**: {{DataSetupStrategy}}

### {{SpecificTestingConcern}}
{{SpecificTestingDescription}}

---

## ⚡ Performance Considerations

{{#PerformancePatterns}}
### {{PerformancePatternName}}
{{PerformancePatternDescription}}

{{/PerformancePatterns}}

---

## 🔒 Security Guidelines

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
**Total {{LayerName}} Interfaces Analyzed**: {{TotalInterfaceCount}}
{{#CoverageByCategory}}
- **{{CategoryName}}**: {{InterfaceCount}} interfaces ({{CoveragePercentage}}% coverage)
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
- `{{PatternRules}}` - Array of pattern rule objects for dynamic iteration
- `{{PatternCategories}}` - Array of pattern category objects with nested patterns
- `{{PatternId}}` - Unique pattern identifier (e.g., "UI-EXT-01", "UI-ORC-01")
- `{{PatternName}}` - Descriptive name of the pattern (e.g., "Event Consumer Base Class Pattern")
- `{{ClassIndexIdentifier}}` - Hash identifier from class index (e.g., "a1b2c3d4e5f6")
- `{{FileName}}` - Source file name (e.g., "OrderEventConsumer.kt")
- `{{Benefits}}` - Array of benefit objects with BenefitName and BenefitDescription
- `{{AntiPatternReasons}}` - Array of reason strings for anti-pattern explanations
- `{{SourceFiles}}` - Array of source file objects with ClassIndexIdentifier and FileName

### Coverage Summary Variables
- `{{LayerName}}` - Architecture layer name (e.g., "UI Layer")
- `{{TotalInterfaceCount}}` - Total number of interfaces analyzed
- `{{CoverageByCategory}}` - Array of coverage objects with CategoryName, InterfaceCount, and CoveragePercentage

### File Analysis Variables
- `{{AnalyzedFiles}}` - List of all files that were analyzed
- `{{ClassIndexIdentifier}}` - Unique hash for file identification
- `{{FileName}}` - Name of the analyzed file

## Usage Instructions

### 1. Pattern Identification
For each UI pattern found in your analysis:
1. Assign a unique pattern ID following the format: `{{LayerPrefix}}-{{CategoryPrefix}}-{{Number}}`
   - Layer Prefix: "UI" for UI Layer
   - Category Prefix: "EXT" for External Interface, "ORC" for Orchestrator, etc.
   - Number: Sequential numbering (01, 02, 03...)

2. Create descriptive pattern names that capture the essence of the pattern
3. Reference the source file using the class index identifier

### 2. Coverage Tracking
- Track total interfaces analyzed per category
- Calculate coverage percentages
- List all analyzed files with their identifiers

### 3. Example Usage - Dynamic Pattern Structure

**AI Input Data Structure Example:**
```json
{
  "PatternCount": 5,
  "PatternCategories": [
    {
      "CategoryName": "UI Layer - External Interface Patterns",
      "Patterns": [
        {
          "PatternIndex": 1,
          "PatternId": "UI-EXT-01",
          "PatternName": "Event Consumer Base Class Pattern",
          "ClassIndexIdentifier": "a1b2c3d4e5f6",
          "FileName": "OrderEventConsumer.kt"
        }
      ]
    }
  ],
  "CoverageByCategory": [
    {
      "CategoryName": "UI Layer - External Interface",
      "InterfaceCount": 3,
      "CoveragePercentage": 100
    }
  ]
}
```

**Template Output Example:**
```markdown
## Pattern Index

### UI Layer - External Interface Patterns
1. **UI-EXT-01**: Event Consumer Base Class Pattern - [a1b2c3d4e5f6] OrderEventConsumer.kt
2. **UI-EXT-02**: Smart Gateway Filtering Pattern - [b2c3d4e5f6a1] ProductEventConsumer.kt

### UI Layer - Orchestrator Patterns
1. **UI-ORC-01**: Scheduled Component Pattern - [d4e5f6a1b2c3] ProcessOrderBatch.kt

### Coverage Summary
**Total UI Layer Interfaces Analyzed**: 8
- **UI Layer - External Interface**: 3 interfaces (100% coverage)
- **UI Layer - Orchestrator**: 5 interfaces (100% coverage)
```

### 4. Pattern Naming Conventions

#### Good Pattern Names
- ✅ **Event Consumer Base Class Pattern** - Clear architectural intent
- ✅ **Smart Gateway Filtering Pattern** - Describes DDD UI layer responsibility
- ✅ **Batch Processing Orchestrator Pattern** - Common orchestration pattern
- ✅ **Command Delegation Pattern** - Describes application layer interaction

#### Bad Pattern Names
- ❌ **Kafka Consumer Pattern** - Too technology-specific
- ❌ **Database Pattern** - Too generic
- ❌ **Helper Pattern** - Vague and unhelpful
- ❌ **Utility Pattern** - Doesn't describe purpose

### 5. Category Organization

#### UI Layer Categories
- **External Interface Patterns**: External system integration, event consumers, API gateways
- **Orchestrator Patterns**: Scheduled tasks, batch processors, workflow coordinators
- **Controller Patterns**: REST endpoints, web interfaces
- **Gateway Patterns**: API gateways, proxy interfaces

#### Pattern ID Prefixes
- `UI-EXT-XX`: External interfaces (event consumers, API gateways)
- `UI-ORC-XX`: Orchestrators (scheduled components, workflow coordinators)
- `UI-CTL-XX`: Controllers (REST endpoints, web controllers)
- `UI-GTW-XX`: Gateways (proxy interfaces, service gateways)

### 6. UI Component Analysis Guidelines

#### What to Analyze
- **Component Structure**: Service annotations, dependency injection patterns, lifecycle management
- **External Integration**: Event consumer patterns, API gateway implementations, external service connections
- **Application Layer Interaction**: How UI components delegate to application layer use cases
- **Error Handling**: Exception handling patterns, error recovery strategies, user feedback mechanisms
- **Configuration Management**: Environment-specific configurations, feature toggles, runtime parameters

#### Pattern Categories to Look For
1. **External Interface Patterns**: How UI components interact with external systems
2. **Orchestration Patterns**: Complex workflow coordination and batch processing
3. **Delegation Patterns**: How UI layer delegates business operations to application layer
4. **Integration Patterns**: Event processing, message handling, API integration approaches
5. **Configuration Patterns**: Runtime configuration, environment management, feature flags

#### UI Layer Responsibilities
- **System Boundary Management**: Acting as entry points for external requests
- **Protocol Translation**: Converting external formats to internal domain models
- **Application Coordination**: Orchestrating multiple application layer operations
- **Error Translation**: Converting domain exceptions to appropriate UI responses
- **Cross-Cutting Concerns**: Logging, monitoring, security, authentication

#### Common UI Layer Components
- **Event Consumers**: Kafka consumers, message processors, stream handlers
- **Scheduled Tasks**: Batch jobs, maintenance tasks, periodic operations
- **REST Controllers**: API endpoints, web interfaces, HTTP handlers
- **Gateway Components**: Proxy services, API gateways, service facades
- **Console Applications**: Command-line tools, batch processors, utilities

#### Anti-Patterns to Identify
- **Business Logic in UI**: Domain rules implemented at UI layer
- **Direct Database Access**: UI components bypassing application layer
- **Technology Coupling**: Over-reliance on specific technologies
- **Monolithic Controllers**: Single components handling too many responsibilities
- **Missing Error Handling**: Inadequate exception handling and user feedback

### 7. Template Completion Checklist

- [ ] All UI component files analyzed and catalogued
- [ ] Pattern IDs assigned following naming convention
- [ ] Coverage percentages calculated per category
- [ ] Good/bad examples provided for major patterns
- [ ] Source references include class index identifiers
- [ ] Implementation guidelines completed for each pattern category
- [ ] Error handling strategies documented
- [ ] Testing approaches specified
- [ ] Performance considerations addressed
- [ ] Security guidelines included where relevant
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines