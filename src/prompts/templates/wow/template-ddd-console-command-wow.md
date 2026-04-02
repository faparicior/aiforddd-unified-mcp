# 🎯 DDD UI Layer - Console Commands - {{PackageName}} Package (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

> This document defines the Console Command patterns and guidelines for the `{{PackageName}}` package following DDD architectural principles.
>
> **Related templates**: `template-ddd-scheduler-wow.md` (Schedulers) | `template-ddd-use-case-wow.md` (Use Cases)

---

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
4. [📐 Core Patterns and Rules](#-core-patterns-and-rules)
5. [🖥️ Command I/O Strategy](#-command-io-strategy)
6. [⚙️ Option & Argument Handling](#-option--argument-handling)
7. [🔁 Idempotency & Dry-Run Strategy](#-idempotency--dry-run-strategy)
8. [🛠️ Implementation Guidelines](#-implementation-guidelines)
9. [⚠️ Error Handling Strategy](#-error-handling-strategy)
10. [🧪 Testing Approach](#-testing-approach)
11. [🔒 Security Guidelines](#-security-guidelines)
12. [📝 Implementation Notes](#-implementation-notes)
13. [🚫 Anti-Patterns to Avoid](#-anti-patterns-to-avoid)
14. [Summary](#summary)
15. [Pattern Index](#pattern-index)
16. [❓ Open Questions](#-open-questions)

---

## 📌 Overview

**Package:** `{{PackageName}}`  
**Description:** {{PackageDescription}}  
**Responsibility:** {{PrimaryResponsibility}}

**Domain Purpose:** {{DomainPurpose}}

**Architecture Layer:** UI Layer - Console Commands

---

## 🏗️ Architecture Position

```
CLI Invocation → Console Command ({{PackageName}}) → Application Layer ({{ApplicationComponents}}) → Domain Layer
```

The `{{PackageName}}` console commands are invoked via CLI tooling and delegate business operations to the application layer, handling argument parsing, I/O formatting, and exit codes.

### Package Structure Convention
_[Describe the package naming and organization pattern]_

Examples:
- _[Add 2-3 generic examples of package structure]_

---

## 📋 Architecture Rules

### 1. Layer Responsibility
- **Purpose**: {{LayerMainPurpose}}
- **Dependencies**: {{AllowedDependencies}}
- **Restrictions**: {{LayerRestrictions}}

### 2. Framework Constraints
{{FrameworkConstraints}}

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

## 🖥️ Command I/O Strategy

### Input Handling
- **Argument Parser**: {{ArgumentParserFramework}} (e.g., Symfony Console, Picocli, Click)
- **Interactive Prompts**: {{InteractivePromptStrategy}} (e.g., ask confirmation for destructive ops)
- **stdin Support**: {{StdinSupport}}

### Output Formatting
- **Output Format**: {{OutputFormatStrategy}} (e.g., text, JSON, table)
- **Progress Feedback**: {{ProgressFeedbackStrategy}} (e.g., progress bar, dots, silent)
- **Verbosity Levels**: {{VerbosityLevels}} (e.g., -v, -vv, --quiet)

### Exit Codes
- **Success**: `0`
- **Partial Failure**: {{PartialFailureExitCode}}
- **Fatal Error**: {{FatalErrorExitCode}}
- **Validation Error**: {{ValidationErrorExitCode}}

**Example:**
```
{{CommandIOExample}}
```

---

## ⚙️ Option & Argument Handling

### Required Arguments
- **{{ArgumentName1}}**: {{ArgumentDescription1}}
- **{{ArgumentName2}}**: {{ArgumentDescription2}}

### Optional Options
- **{{OptionName1}}**: {{OptionDescription1}} (default: {{Default1}})
- **{{OptionName2}}**: {{OptionDescription2}} (default: {{Default2}})

### Validation Rules
- **{{ValidationRule1}}**: {{ValidationDescription1}}
- **{{ValidationRule2}}**: {{ValidationDescription2}}

**Example:**
```
{{ArgumentHandlingExample}}
```

---

## 🔁 Idempotency & Dry-Run Strategy

### Idempotency Approach
- **Idempotent**: {{IsIdempotent}} (Yes/No/Partial)
- **Idempotency Mechanism**: {{IdempotencyMechanism}} (e.g., check-before-act, upsert, idempotency key)
- **Re-run Safety**: {{ReRunSafetyDescription}}

### Dry-Run Support
- **Dry-Run Flag**: {{DryRunFlagName}} (e.g., `--dry-run`)
- **Dry-Run Behavior**: {{DryRunBehavior}}
- **Output Difference**: {{DryRunOutputDifference}}

**Example:**
```
{{DryRunExample}}
```

---

## 🛠️ Implementation Guidelines

### Dependency Injection
- **{{DIPattern}}**: {{DIDescription}}
- **Configuration**: {{ConfigurationApproach}}

### Use Case Delegation
- **{{DelegationPattern}}**: {{DelegationDescription}}
- **Command ↔ Use Case Mapping**: {{CommandUseCaseMapping}}

{{#ImplementationGuidelines}}
### {{GuidelineName}}
{{GuidelineDescription}}

{{/ImplementationGuidelines}}

---

## ⚠️ Error Handling Strategy

### Validation Errors
{{ValidationErrorStrategy}}

**Example:**
```
{{ValidationErrorExample}}
```

### Application Exceptions
{{ApplicationExceptionStrategy}}

### Infrastructure Failures
{{InfrastructureFailureStrategy}}

---

## 🧪 Testing Approach

### Unit Testing
- **{{UnitTestPattern}}**: {{UnitTestDescription}}
- **Mock Strategy**: {{MockStrategy}}
- **Coverage Target**: {{CoverageTarget}}

### Integration Testing
- **{{IntegrationTestPattern}}**: {{IntegrationTestDescription}}
- **Test Environment**: {{TestEnvironment}}
- **I/O Assertion**: {{IOAssertionApproach}}

### Console Command Testing Rules

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

## 🔒 Security Guidelines

### Input Sanitization
- **{{InputSanitizationPattern}}**: {{InputSanitizationDescription}}
- **Shell Injection Prevention**: {{ShellInjectionPrevention}}

### Privileged Operations
- **{{PrivilegedOperationPattern}}**: {{PrivilegedOperationDescription}}
- **Confirmation Requirement**: {{ConfirmationRequirement}}

### Secrets & Credentials
- **{{CredentialPattern}}**: {{CredentialDescription}}

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
**Total UI Layer Console Commands Analyzed**: {{TotalInterfaceCount}}
{{#CoverageByCategory}}
- **{{CategoryName}}**: {{InterfaceCount}} console commands ({{CoveragePercentage}}% coverage)
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
- `{{PatternId}}` - Unique pattern identifier (e.g., "CMD-DEF-01", "CMD-VAL-01")
- `{{PatternName}}` - Descriptive name of the pattern
- `{{ClassIndexIdentifier}}` - Hash identifier from class index
- `{{FileName}}` - Source file name
- `{{Benefits}}` - Array of benefit objects
- `{{AntiPatternReasons}}` - Array of reason strings
- `{{SourceFiles}}` - Array of source file objects

### Console Command-Specific Variables
- `{{ArgumentParserFramework}}` - CLI framework used
- `{{InteractivePromptStrategy}}` - How interactive confirmations work
- `{{OutputFormatStrategy}}` - Default output format
- `{{ProgressFeedbackStrategy}}` - Progress indication approach
- `{{IsIdempotent}}` - Whether the command is idempotent
- `{{DryRunFlagName}}` - Name of the dry-run option flag
- `{{PartialFailureExitCode}}` - Exit code for partial success
- `{{FatalErrorExitCode}}` - Exit code for fatal errors

### Coverage Summary Variables
- `{{TotalInterfaceCount}}` - Total number of console commands analyzed
- `{{CoverageByCategory}}` - Array of coverage objects

### File Analysis Variables
- `{{AnalyzedFiles}}` - List of all files analyzed
- `{{AdjacentCollaborators}}` - List of adjacent collaborator files

## Usage Instructions

### 1. Console Command Analysis
- Identify argument/option parsing framework
- Catalogue all arguments, options, and flags
- Document exit code conventions
- Map each command to its application-layer use case

### 2. Pattern ID Format
- `CMD-DEF-XX`: Command definition and registration patterns
- `CMD-VAL-XX`: Input validation and argument parsing patterns
- `CMD-EXE-XX`: Command execution and use-case delegation patterns
- `CMD-OUT-XX`: Output formatting and progress feedback patterns
- `CMD-ERR-XX`: Error handling and exit code patterns

### 3. Template Completion Checklist

- [ ] All console command files analyzed and catalogued
- [ ] Argument/option schema documented
- [ ] I/O strategy and exit codes documented
- [ ] Idempotency and dry-run approach described
- [ ] Pattern IDs assigned following naming convention
- [ ] Good/bad examples provided for major patterns
- [ ] Security guidelines completed (input sanitization, confirmation for destructive ops)
- [ ] Testing approaches specified
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines
