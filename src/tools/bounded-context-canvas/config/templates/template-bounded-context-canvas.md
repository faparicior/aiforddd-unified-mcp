# 🧭 Bounded Context Canvas

> **AI Instructions:** This template helps document a bounded context using Domain-Driven Design principles. Replace all placeholders marked with `{{placeholder}}` with actual information from the context being documented. Remove instructional notes (lines starting with >) from the final document.

---

## 📋 Overview

| Section | Content |
|----------|----------|
| **Name** | {{context_name}} |
| **Purpose** | {{context_purpose}} |

> **AI Guidance:**
> - Name: Short, clear identifier (e.g., "User Management", "Payment Processing", "Order Fulfillment")
> - Purpose: 1-2 sentences describing the main responsibility and business capability

**Example:**
```
| **Name** | Order Management |
| **Purpose** | Manages the complete order lifecycle from creation to fulfillment, including inventory validation, payment processing, and delivery coordination. |
```

---

## 🧩 Strategic Classification

| Domain | Business Model | Evolution |
|---------|----------------|-----------|
| {{domain_type}} | {{business_model_type}} | {{evolution_stage}} |

> **AI Guidance:** 
> - **Domain Type:** Core (key differentiator), Supporting (necessary but not core), Generic (common, could be outsourced)
> - **Business Model:** Revenue Generator, Cost Reducer, Compliance, Engagement
> - **Evolution Stage:** Genesis (new), Custom Built, Product, Commodity

**Example:**
```
| Core | Revenue Generator | Product |
```

---

## 👥 Domain Roles

| Role Types |
|-------------|
| {{role_1}} |
| {{role_2}} |
| {{role_n}} |

> **AI Guidance:** List the key domain roles/actors that interact with this context (e.g., Administrator, Customer, Analyst, Order Manager, Support Agent)

**Example:**
```
| Customer |
| Order Manager |
| Support Agent |
```

---

## 🧠 Swimlane: Communication → Business Decisions → Communication

| Collaborator | Consumer/UI | 📥 Inbound communication | 🏗️ Infrastructure decisions | 💡 Business decisions | 📤 Outbound communication | Collaborator |
|--------------|-------------|--------------------------|-----------------------------|-----------------------|---------------------------|--------------|
| | | **Collaborators:** {{inbound_collaborators}} | **Decisions:**                | **Decisions:** | **Collaborators:** {{outbound_collaborators}} | |
| {{inbound_collaborator_1}} | {{consumer_1}} | 🟦 Command: {{inbound_command_1}} | {{infrastructure_decision_1}} | 🟧 Decision: {{business_rule_1}} | 🟨 Event: {{outbound_event_1}} | {{outbound_collaborator_1}} |
| {{inbound_collaborator_2}} | {{consumer_2}} | 🟩 Query: {{inbound_query_1}} | {{infrastructure_decision_2}} | 🟧 Decision: {{business_rule_2}} | 🟦 Command: {{outbound_command_1}} | {{outbound_collaborator_2}} |
| {{inbound_collaborator_3}} | {{consumer_3}} | 🟨 Event: {{inbound_event_1}} | {{infrastructure_decision_3}} | 🟧 Decision: {{business_rule_3}} | 🟨 Event: {{outbound_event_2}} | {{outbound_collaborator_3}} |
| {{inbound_collaborator_4}} | {{consumer_4}} | 🟦 Command: {{inbound_command_2}} |                               | | 🟩 Query: {{outbound_query_1}} | {{outbound_collaborator_4}} |
| {{inbound_collaborator_5}} | {{consumer_5}} | 🟩 Query: {{inbound_query_2}} |                               | 🟧 Decision: {{business_rule_4}} | | |

> **AI Guidance:**
> - **Collaborator (Left Column):** Specific context/system/service sending each inbound command, query, or event
> - **Consumer/UI:** Specific component that processes the inbound communication - Kafka consumer class, API controller, UI component, or service handler (e.g., "OrdersConsumer", "UserEventsConsumer", "ProductController", "AdminDashboard", "ReportsUI")
> - **Inbound Collaborators:** Summary of all contexts or systems that send commands/queries/events to this context
> - **Commands (🟦):** Actions that trigger state changes (e.g., "Create order", "Update inventory")
> - **Queries (🟩):** Read-only requests for data (e.g., "Get user profile", "Fetch product catalog")
> - **Events (🟨):** Domain events that occurred in other contexts and are consumed here (e.g., "Order placed", "User registered")
> - **Infrastructure Decisions (🏗️):** Filtering, routing, and pre-processing rules applied at the infrastructure layer BEFORE reaching domain/use case logic (e.g., "Events from tenant ABC filtered", "Only mobile app events processed", "Messages with invalid schema rejected", "Events older than 1 year discarded", "Rate limiting: max 100 req/min per client").
> - **Business Decisions (🟧):** Core business rules and policies applied within this context
> - **Outbound Collaborators:** Summary of contexts/systems this context communicates with
> - **Collaborator (Right Column):** Specific context/system/service consuming each outbound event, command, or query
>
> **CRITICAL - Query Direction:**
> - **Inbound Queries:** External systems/clients calling YOUR bounded context's APIs/endpoints (e.g., "API Consumers → Get user profile")
> - **Outbound Queries:** YOUR bounded context calling external systems/APIs (e.g., "Legacy System ← Get customer data")
> - **Common mistake:** Placing API endpoints in outbound section. API endpoints are INBOUND (clients call you)
>
> **Query Swimlanes - Consumer/UI Column:**
> - For API queries, include the route→controller mapping (e.g., "/user/profile→UserController", "/orders/daily→OrderHistoryController")
> - For external system queries, include the client/adapter class (e.g., "LegacySystemClient", "PaymentGatewayAdapter")
> - This provides direct traceability from business queries to technical implementation
>
> **Cross-Cutting Decisions:**
> - Decisions that apply across multiple use cases or affect the entire system should be moved to the separate "General/Cross-Cutting Decisions" section
> - Only include context-specific decisions directly related to communications in the swimlane
> - The swimlane should focus on decisions that are directly tied to specific inbound/outbound communications
> - **System-wide decisions** (database config, error handling patterns, messaging protocols) → General/Cross-Cutting Decisions section
> - **Communication-specific decisions** (validation rules for specific events, business rules for particular queries) → Swimlane
>
> **Note:** For rows containing only business decisions or ubiquitous language definitions (no communications),
> leave the Collaborator columns empty
>
> **Important:** Events can appear in both inbound and outbound columns:
> - **Inbound Events:** Events from other contexts that this context subscribes to and reacts to
> - **Outbound Events:** Events published by this context for other contexts to consume

---

## ⚙️ General/Cross-Cutting Decisions

### Infrastructure Decisions

| Decision |
|----------|
| {{infrastructure_decision_1}} |
| {{infrastructure_decision_2}} |
| {{infrastructure_decision_3}} |

### Business Decisions

| Decision |
|----------|
| {{business_decision_1}} |
| {{business_decision_2}} |
| {{business_decision_3}} |

> **AI Guidance:**
> - **Infrastructure Decisions:** Technical implementation choices that affect the entire system: database configuration, messaging patterns, error handling strategies, connection pooling, serialization, monitoring, deployment patterns
> - **Business Decisions:** Domain-specific rules and policies that apply across multiple use cases: data validation rules, business logic patterns, API design choices, data architecture decisions, domain constraints
> - **Organization:** List Infrastructure Decisions first, then Business Decisions for clear separation of concerns
> - **Scope:** Include decisions that affect multiple contexts or are foundational to the system architecture

---
---

## 📏 Business Rules

> **AI Guidance:**
> - **Business Rules:** Conditional logic that determines behavior based on specific circumstances (When/Then structure)
> - **Rule ID:** Unique identifier for traceability (e.g., BR-ORD-001, BR-USR-002) with format `BR-{CONTEXT}-###`
> - **Name:** Clear, descriptive name for the business rule
> - **Applies To:** The domain entity, aggregate, or process where this rule applies
> - **When:** The condition or trigger that activates this rule
> - **Then:** The action or outcome when the condition is met
> - **Why:** The business rationale or purpose behind the rule
> - **Classes Involved:** The implementation classes that enforce this rule (e.g., validators, services, domain entities)
> - **Organization:** Group related rules into logical sections by domain concept or feature area

**Example:**
```
### Order Validation Rules

| Rule ID | Name | Applies To | When | Then | Why | Classes involved |
|---------|------|------------|------|------|-----|------------------|
| BR-ORD-001 | Minimum Order Amount | Order Creation | Order total < $10 | Reject order with validation error | Ensures orders are economically viable | OrderValidator, Order |
| BR-ORD-002 | Stock Availability | Order Processing | Product stock = 0 | Mark item as backorder | Prevents overselling inventory | InventoryService, OrderItem |
```

### {{BusinessRuleSection1Title}}

| Rule ID      | Name                                 | Applies To                | When                                         | Then                                                        | Why                                                                 | Classes involved |
|--------------|--------------------------------------|---------------------------|----------------------------------------------|-------------------------------------------------------------|---------------------------------------------------------------------|-----------------|
| {{RuleID1}}   | {{RuleName1}}                             | {{RuleAppliesTo1}}             | {{RuleWhen1}}                                     | {{RuleThen1}}                                                    | {{RuleWhy1}}                                                            | {{RuleClassesInvolved1}} |
| {{RuleID2}}   | {{RuleName2}}                             | {{RuleAppliesTo2}}             | {{RuleWhen2}}                                     | {{RuleThen2}}                                                    | {{RuleWhy2}}                                                            | {{RuleClassesInvolved2}} |
| {{RuleID3}}   | {{RuleName3}}                             | {{RuleAppliesTo3}}             | {{RuleWhen3}}                                     | {{RuleThen3}}                                                    | {{RuleWhy3}}                                                            | {{RuleClassesInvolved3}} |

### {{BusinessRuleSection2Title}}

| Rule ID      | Name                                 | Applies To                | When                                         | Then                                                        | Why                                                                 | Classes involved |
|--------------|--------------------------------------|---------------------------|----------------------------------------------|-------------------------------------------------------------|---------------------------------------------------------------------|-----------------|
| {{RuleID4}}   | {{RuleName4}}                             | {{RuleAppliesTo4}}             | {{RuleWhen4}}                                     | {{RuleThen4}}                                                    | {{RuleWhy4}}                                                            | {{RuleClassesInvolved4}} |
| {{RuleID5}}   | {{RuleName5}}                             | {{RuleAppliesTo5}}             | {{RuleWhen5}}                                     | {{RuleThen5}}                                                    | {{RuleWhy5}}                                                            | {{RuleClassesInvolved5}} |

---

## 🔐 Invariants

> **AI Guidance:**
> - **Invariants:** Consistency rules that must ALWAYS be true for a domain entity or aggregate to be in a valid state
> - **Invariant ID:** Unique identifier for traceability (e.g., INV-ORD-001, INV-USR-002) with format `INV-{CONTEXT}-###`
> - **Name:** Clear, descriptive name for the invariant
> - **Applies To:** The domain entity or aggregate that must maintain this invariant
> - **Description:** Complete statement of the constraint that must always hold true (e.g., "Order total must equal sum of all line items", "Account balance cannot be negative")
> - **DDD Classification:** The DDD pattern used to enforce this invariant:
>   - **Entity Invariant:** Enforced within a single entity's constructor/methods
>   - **Aggregate Invariant:** Enforced by the aggregate root across multiple entities
>   - **Value Object Invariant:** Enforced by immutable value object construction
>   - **Domain Service Invariant:** Enforced by a domain service when spanning multiple aggregates
> - **Classes Involved:** The implementation classes that enforce this invariant (e.g., aggregate roots, entities, value objects, domain services)
> - **Organization:** Group related invariants by aggregate or domain concept
> - **Key Distinction from Business Rules:** Invariants are unconditional constraints (always true), while business rules are conditional logic (when/then)

**Example:**
```
### Order Aggregate Invariants

| Invariant ID | Name | Applies To | Description | DDD Classification | Classes involved |
|--------------|------|------------|-------------|-------------------|------------------|
| INV-ORD-001 | Order Total Consistency | Order | Order total must equal the sum of all line item prices plus tax minus discounts | Aggregate Invariant | Order (aggregate root), OrderItem |
| INV-ORD-002 | Non-Empty Order | Order | An order must contain at least one order item | Aggregate Invariant | Order (aggregate root) |
| INV-ORD-003 | Positive Quantity | OrderItem | Order item quantity must be greater than zero | Entity Invariant | OrderItem |
| INV-ORD-004 | Valid Email Format | CustomerEmail | Customer email must follow RFC 5322 format | Value Object Invariant | CustomerEmail (value object) |
```

### {{InvariantSection1Title}}

| Invariant ID | Name                                      | Applies To                  | Description                                                                                 | DDD Classification | Classes involved |
|--------------|-------------------------------------------|-----------------------------|---------------------------------------------------------------------------------------------|-------------------|-----------------|
| {{InvariantID1}} | {{InvariantName1}}                                | {{InvariantAppliesTo1}}               | {{InvariantDescription1}}                                                                             | {{InvariantDDDClassification1}} | {{InvariantClassesInvolved1}} |
| {{InvariantID2}} | {{InvariantName2}}                                | {{InvariantAppliesTo2}}               | {{InvariantDescription2}}                                                                             | {{InvariantDDDClassification2}} | {{InvariantClassesInvolved2}} |
| {{InvariantID3}} | {{InvariantName3}}                                | {{InvariantAppliesTo3}}               | {{InvariantDescription3}}                                                                             | {{InvariantDDDClassification3}} | {{InvariantClassesInvolved3}} |

### {{InvariantSection2Title}}

| Invariant ID | Name                                      | Applies To                  | Description                                                                                 | DDD Classification | Classes involved |
|--------------|-------------------------------------------|-----------------------------|---------------------------------------------------------------------------------------------|-------------------|-----------------|
| {{InvariantID4}} | {{InvariantName4}}                                | {{InvariantAppliesTo4}}               | {{InvariantDescription4}}                                                                             | {{InvariantDDDClassification4}} | {{InvariantClassesInvolved4}} |
| {{InvariantID5}} | {{InvariantName5}}                                | {{InvariantAppliesTo5}}               | {{InvariantDescription5}}                                                                             | {{InvariantDDDClassification5}} | {{InvariantClassesInvolved5}} |

> **AI Guidance - ID Management:**
> 
> **CRITICAL: NEVER REUSE RETIRED IDs**
> 
> **ID Allocation Strategy:**
> - Business Rules: `BR-{CONTEXT}-001`, `BR-{CONTEXT}-002`, etc.
> - Invariants: `INV-{CONTEXT}-001`, `INV-{CONTEXT}-002`, etc.
> - {CONTEXT} = 2-4 letter abbreviation (e.g., AD, ES, ORD, USR)
> 
> **When Adding New Rules/Invariants:**
> 1. Find the highest existing ID in the category
> 2. Increment by 1 (skip any retired numbers)
> 3. Document in changelog with creation reason
> 
> **When Deleting Rules/Invariants:**
> 1. Add HTML comment: `<!-- BR-ES-001: RETIRED - See changelog entry 2025-08-04 -->`
> 2. Document in changelog with retirement reason
> 3. Keep the commented entry for historical reference
> 4. **NEVER reuse the ID number**
> 
> **Example Evolution:**
> ```markdown
> Initial:
> BR-ES-001: Minimum Threshold Protection
> BR-ES-002: Error Buffer Threshold Protection  
> BR-ES-003: Retention-Based Buffer Cleanup
> 
> After deleting BR-ES-001:
> <!-- BR-ES-001: RETIRED - See changelog entry 2025-08-04 -->
> BR-ES-002: Error Buffer Threshold Protection  
> BR-ES-003: Retention-Based Buffer Cleanup
> BR-ES-004: New Rule Added Later  <!-- Skip BR-ES-001 -->
> ```
> 
> **Why This Matters:**
> - ✅ Traceability: Clear history of changes
> - ✅ Reference Integrity: Old documents remain valid
> - ✅ Audit Trail: Easy evolution tracking
> - ✅ No Confusion: Each ID = one concept over time

---

## 🗣️ Ubiquitous Language

| Term | Definition |
|------|------------|
| **{{term_1}}** | {{definition_1}} |
| **{{term_2}}** | {{definition_2}} |
| **{{term_3}}** | {{definition_3}} |

> **AI Guidance:**
> - **Ubiquitous Language:** Key domain terms with clear, shared definitions (3-7 terms recommended)

**Example:**
```
| Collaborator | Consumer/UI | 📥 Inbound Communication | 🏗️ Infrastructure Decisions | 💡 Business Decisions | 📤 Outbound Communication | Collaborator |
|--------------|-------------|--------------------------|-----------------------------|-----------------------|---------------------------|--------------|
| Orders Context | OrderConsumer | 🟨 Event: OrderPlaced | Events from tenant ABC filtered | | | |
| API Consumers | OrderController | 🟩 Query: GetOrderStatus | API requests rate limited to 100/min per client | 🟧 Decision: Orders are processed only during business hours | | |
| Admin Tools | ValidationController | 🟩 Query: ValidateOrderData | Only authenticated requests processed | | | |
| | | | | | 🟩 Query: GetInventoryData | Inventory System |
| | | | | | 🟨 Event: OrderStatusUpdated | Notification Service |

## ⚙️ General/Cross-Cutting Decisions

### Infrastructure Decisions

| Decision |
|----------|
| Database connection timeout set to 5 seconds for fast-fail behavior |
| Event timestamps older than 1 year are rejected to prevent stale data processing |
| Jackson ObjectMapper handles JSON deserialization with custom module configuration |

### Business Decisions

| Decision |
|----------|
| All orders require both customer ID and product ID for processing |
| Order processing follows three-stage validation: syntax, business rules, inventory |
| Cancelled orders retain historical data for audit purposes |

| Term | Definition |
|------|------------|
| **Order** | A customer request to purchase products or services. |
| **Fulfillment** | The process of completing and delivering an order. |
| **Customer** | The person or entity placing an order. |
```

---

## ⚙️ Assumptions

| Assumption |
|-------------|
| {{assumption_1}} |
| {{assumption_2}} |
| {{assumption_n}} |

> **AI Guidance:** Document key assumptions about scope, responsibilities, data ownership, or external dependencies. These help clarify boundaries and expectations.

**Example:**
```
| All order processing logic is centralized in this context. |
| External services are responsible for their own data validation before sending events. |
| Order data retention follows company-wide policy of 7 years. |
```

---

## 📊 Verification Metrics

| Metric |
|---------|
| {{metric_1}} |
| {{metric_2}} |
| {{metric_n}} |

> **AI Guidance:** Define measurable indicators that verify this context is fulfilling its purpose correctly. Include SLOs, quality metrics, or business KPIs.

**Example:**
```
| Order processing latency < 5 seconds for 95% of requests |
| Data accuracy rate > 99.9% compared to source events |
| Zero duplicate order entries per processing window |
```

---

## ❓ Open Questions

| Question |
|-----------|
| {{question_1}} |
| {{question_2}} |
| {{question_n}} |

> **AI Guidance:** List unresolved questions, areas needing clarification, or decisions pending stakeholder input. Remove this section once all questions are resolved.

**Example:**
```
| Should we support real-time order updates or is batch processing sufficient? |
| How do we handle orders for discontinued products? |
| What's the strategy for migrating historical orders from legacy system? |
```

---

## 🗂 Legend

| Emoji | Meaning |
|--------|----------|
| 🟦 | **Command** — triggers a state change |
| 🟩 | **Query** — retrieves data without changing state |
| 🟨 | **Event** — signals something that has happened |
| 🟧 | **Decision** — domain rule or policy applied internally |

---

## 📝 AI Generation Checklist

When generating a Bounded Context Canvas document, ensure:

- [ ] Context name is clear and reflects the domain language
- [ ] Purpose explains WHAT and WHY in business terms
- [ ] Strategic classification accurately positions the context
- [ ] All relevant domain roles are identified
- [ ] Inbound collaborators summary lists all upstream systems/contexts
- [ ] Each inbound communication has its specific collaborator identified in left column
- [ ] Inbound communications list all incoming commands, queries, and events
- [ ] **CRITICAL:** Inbound queries are external clients calling YOUR APIs (not you calling others)
- [ ] **CRITICAL:** Outbound queries are YOUR context calling external APIs (not others calling you)
- [ ] **CRITICAL:** API query Consumer/UI column includes route→controller mapping (e.g., "/user/profile→UserController")
- [ ] External query Consumer/UI column includes client/adapter class names
- [ ] Inbound events represent domain events from other contexts that trigger reactions
- [ ] Business decisions are backed by actual code implementation when possible
- [ ] Business decisions are aligned with their corresponding communications
- [ ] Outbound collaborators summary lists all downstream consumers
- [ ] Each outbound communication has its specific collaborator identified in right column
- [ ] Outbound communications show events, commands, and queries
- [ ] Outbound events represent domain events published by this context
- [ ] Rows with only decisions/language have empty collaborator columns
- [ ] Infrastructure decisions focus on filtering, routing, and pre-processing rules at infrastructure layer
- [ ] **NEW:** General/Cross-Cutting Decisions section is included with separate Infrastructure and Business subsections
- [ ] **NEW:** Infrastructure Decisions listed first in General/Cross-Cutting section, then Business Decisions
- [ ] **NEW:** Cross-cutting decisions are moved from swimlane to dedicated section for better organization
- [ ] General/Cross-Cutting Infrastructure Decisions include: database config, messaging patterns, error handling, monitoring, deployment
- [ ] General/Cross-Cutting Business Decisions include: domain rules, API design, data architecture, validation patterns
- [ ] Ubiquitous language defines 3-7 key domain terms
- [ ] Assumptions are explicit and documented
- [ ] Metrics are measurable and relevant
- [ ] Open questions are tracked (or section removed if none)
- [ ] All placeholder text has been replaced
- [ ] Examples and instructional notes have been removed
