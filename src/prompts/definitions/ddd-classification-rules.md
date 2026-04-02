# DDD Classification Rules (Condensed)

## Core Definitions

### Invariant
A condition that **must always be true** for structural integrity of the domain model.
- Enforced at object level (constructors, init blocks)
- Independent of business policies
- Violating it makes the object invalid
- **Layer**: Domain (Entities, Value Objects, Aggregates)
- **Example**: `require(value > 0)` in a Quantity value object

### Business Rule
Logic reflecting **how the business operates**.
- Subject to change based on policies
- Context-dependent, enforced at service/use case level
- **Layer**: Domain/Application (Services, Use Cases)
- **Example**: "Orders above $10,000 require manual review"

### Validation Rule
Technical constraint ensuring **data format correctness** at system boundaries.
- Technical/syntactic validation (type checking, format)
- Enforced before domain processing
- **Layer**: Application/Infrastructure (Mappers, Controllers, DTOs)
- **Example**: "email field must be valid string format"

### Integration Rule
Constraint that **protects the domain** from external systems.
- Boundary protection, filters/rejects incompatible data
- Anti-corruption layer policies
- **Layer**: Infrastructure (Consumers, Adapters)
- **Example**: "Reject events with source != 'trusted-system'"

### Factory/Creation
Methods or patterns facilitating object construction.
- Simplifies instantiation with defaults
- **Layer**: Domain (Companion objects, Factory classes)
- **Example**: `fun createDefault()` factory method

### Transformations
Operations that convert, calculate, or derive data.
- Unit conversion, format mapping, calculations
- **Layer**: Domain/Infrastructure (Value Objects, Mappers)
- **Example**: Converting meters to kilometers

### Identity Management
How an object establishes unique identity.
- Only for Entities and Aggregates (NOT Value Objects)
- Equality based on ID, not attributes
- **Layer**: Domain
- **Example**: Entity with ID property and ID-based equals()

### Lifecycle Management
How an object transitions through states.
- Manages state transitions with validation
- **Layer**: Domain (Entities, Aggregates)
- **Example**: Order status: DRAFT → SUBMITTED → APPROVED

### Domain Events
Notifications about significant domain occurrences.
- Emitted by Aggregates
- Immutable, represent past facts
- **Layer**: Domain
- **Example**: OrderPlacedEvent, PaymentReceivedEvent

### Integration Event
Events crossing bounded contexts or system boundaries.
- Uses primitives (String, Int, BigDecimal) not domain types
- Includes event metadata (eventId, version, correlationId)
- Designed for serialization (JSON, Avro, Protobuf)
- **Layer**: Infrastructure
- **Example**: External system notification events

### Aggregate Consistency
Maintaining invariants across aggregate boundary.
- Ensures transactional consistency within aggregate
- Coordinates child entities
- **Layer**: Domain (Aggregate Roots only)
- **Example**: Order ensuring all OrderItems have valid quantities

### External Dependencies
Integration with external services/systems.
- Depends on repositories, APIs, message brokers
- **Layer**: Domain/Application (Services)
- **Example**: Service calling geocoding API

### Event Mapping
Converting between external event formats and domain models.
- Anti-corruption layer responsibility
- **Layer**: Infrastructure (Consumers, Adapters)
- **Example**: External API event → Domain event

### Error Handling
Managing and responding to error conditions.
- Retry, circuit breaker, fallback patterns
- **Layer**: Infrastructure/Application
- **Example**: Dead letter queue for failed event processing

### Idempotency
Ability to process same request/event multiple times with same result.
- Prevents duplicate processing
- Uses idempotency keys or deduplication
- **Layer**: Infrastructure/Application
- **Example**: Checking if event ID already processed

### Side Effects
Actions that change state outside function scope.
- I/O operations, event publishing, external notifications
- **Layer**: Services, Repositories, Consumers
- **Example**: Saving to database, publishing events

### Transaction Management
Coordinating database or distributed transactions.
- Ensures ACID properties
- Manages commit/rollback, saga patterns
- **Layer**: Infrastructure/Application
- **Example**: @Transactional annotation

### Inbound Communication
Receives requests/events from external sources.
- HTTP requests, message consumption, event listening
- **Layer**: User Interface (Controllers, Consumers)
- **Example**: REST endpoint, Kafka consumer

### Outbound Communication
Sends requests/events to external systems.
- HTTP/API calls, event publishing, message production
- **Layer**: Infrastructure (API clients, Publishers)
- **Example**: Publishing to message broker

### Possible Outsider
Classes showing DDD violations.
- Layer violations, mixed responsibilities, anti-patterns
- Business logic in wrong layer
- **Layer**: Any
- **Example**: Entity doing I/O, domain depending on infrastructure

### Event Handler (DDD Category)
Application-layer component that responds to published domain or integration events.
- Orchestrates application responses to events (delegates business logic to use cases)
- Typically implements idempotency to handle duplicate deliveries
- **Layer**: Application
- **Example**: `UserRegisteredEventHandler` calling `SendWelcomeEmailUseCase`

### Factory (DDD Category)
Dedicated class responsible for creating complex domain objects.
- Encapsulates creation logic with business rules and invariants
- Differs from factory methods on entities (this is a standalone class)
- **Layer**: Domain
- **Example**: `LoanApplicationFactory` combining credit score + risk assessment

### Specification (DDD Category)
Composable predicate encapsulating a business rule for filtering, querying, or validating domain objects.
- Supports `and()`, `or()`, `not()` composition
- Reusable across domain services and repositories
- **Layer**: Domain
- **Example**: `EligibleForDiscountSpecification`, `ActiveCustomerSpecification`

### Policy (DDD Category)
Pluggable strategy encapsulating a business decision that varies by context.
- Implements strategy/polymorphism to replace conditional logic
- Can be injected at runtime to change behavior
- **Layer**: Domain
- **Example**: `ShippingCostPolicy`, `TaxCalculationPolicy`, `DiscountPolicy`

### Saga (DDD Category)
Orchestrates a multi-step business workflow across multiple aggregates or services.
- Manages distributed transactions with compensating actions for rollback
- Tracks saga state through multiple steps
- **Layer**: Domain/Application
- **Example**: `PurchaseOrderSaga` (reserve inventory → authorize payment → confirm)

### Mapper (DDD Category)
Transforms data between domain objects and external representations.
- Converts domain entities to DTOs/entities and vice versa
- Located in infrastructure layer; never contains business rules
- **Layer**: Infrastructure
- **Example**: `OrderMapper.toDomain()`, `OrderMapper.toEntity()`

### Adapter (DDD Category)
Wraps an external system or library to conform to a domain interface contract.
- Acts as an anti-corruption layer isolating domain from external concerns
- Implements a domain port interface (dependency inversion)
- **Layer**: Infrastructure
- **Example**: `SendGridNotificationAdapter implements NotificationPort`

### Projection (DDD Category)
Builds and maintains read-optimized view models by processing domain events (CQRS read side).
- Listens to domain events and updates read model store
- Must implement idempotency to avoid duplicate processing
- **Layer**: Infrastructure
- **Example**: `OrderProjection` handling `OrderPlacedEvent`, `OrderShippedEvent`

### Read Model (DDD Category)
Optimized data structure used exclusively for query operations on the CQRS read side.
- Built by Projections; never written to directly by business operations
- May denormalize data for query performance
- **Layer**: Infrastructure
- **Example**: `OrderSummaryReadModel`, `CustomerDashboardReadModel`

---

## Quick Decision Framework

| If the class... | Then mark... |
|----------------|--------------|
| Validates structural integrity in constructor/init | **Invariants** ✓ |
| Enforces changeable business policies at service level | **Business Rules** ✓ |
| Validates technical formats at boundaries (mapper/controller) | **Validation Rules** ✓ |
| Filters external system data at integration points | **Integration Rules** ✓ |
| Has factory methods or builder patterns | **Factory/Creation** ✓ |
| Converts between formats or calculates derived values | **Transformations** ✓ |
| Is Entity/Aggregate with ID-based equality | **Identity Management** ✓ |
| Manages state transitions | **Lifecycle Management** ✓ |
| Emits or IS a domain event | **Domain Events** ✓ |
| IS an integration event crossing bounded contexts | **Integration event** ✓ |
| Is Aggregate Root coordinating child entities | **Aggregate Consistency** ✓ |
| Depends on external APIs/repositories | **External Dependencies** ✓ |
| Translates external events to domain | **Event Mapping** ✓ |
| Has retry/circuit breaker/fallback logic | **Error Handling** ✓ |
| Checks for duplicate processing | **Idempotency** ✓ |
| Performs I/O or publishes events | **Side Effects** ✓ |
| Manages transactions or sagas | **Transaction Management** ✓ |
| Receives HTTP requests, consumes messages/events | **Inbound communication** ✓ |
| Makes API calls, publishes events/messages | **Outbound communication** ✓ |
| Violates DDD principles or has mixed responsibilities | **Possible outsider** ✓ |

---

## Common Patterns by DDD Category

### Value Objects
- ✅ Invariants, Transformations, Factory/Creation
- ❌ Identity Management (use structural equality)

### Entities
- ✅ Invariants, Business Rules, Identity Management
- Often: Lifecycle Management

### Aggregates
- ✅ All of Entity + Aggregate Consistency
- Often: Domain Events, Lifecycle Management

### Domain Services
- ✅ Business Rules, External Dependencies

### Application Services/Use Cases
- ✅ Business Rules, External Dependencies, Side Effects, Transaction Management

### Event Consumers
- ✅ Integration Rules, Event Mapping, External Dependencies, Inbound communication
- Often: Error Handling, Idempotency, Outbound communication

### Integration Events
- ✅ Integration event
- Sometimes: Transformations
- ❌ Business Rules, Domain Events, Side Effects

### Controllers
- ✅ Inbound communication, Validation Rules
- Sometimes: Business Rules, External Dependencies

### API Clients
- ✅ Outbound communication, External Dependencies, Side Effects
- Sometimes: Transformations, Error Handling, Validation Rules
- Often: Error Handling (retry, circuit breaker, timeout)

### Gateways
- ✅ Outbound communication, External Dependencies, Side Effects, Transformations
- Sometimes: Error Handling, Integration Rules

### Event Publishers
- ✅ Outbound communication, External Dependencies, Side Effects
- Sometimes: Transformations, Error Handling

### Mappers
- ✅ Validation Rules, Transformations
- ❌ Business Rules, Inbound/Outbound communications

### Event Handlers (Application)
- ✅ Inbound communication, External Dependencies, Side Effects
- Often: Event Mapping, Error Handling, Idempotency
- ❌ Business Rules (delegate to use cases), Invariants

### Factories (Domain)
- ✅ Factory/Creation, Business Rules
- Sometimes: Invariants, External Dependencies
- ❌ Side Effects, Inbound/Outbound communications

### Specifications (Domain)
- ✅ Business Rules
- Sometimes: Transformations
- ❌ Side Effects, External Dependencies, Lifecycle Management

### Policies (Domain)
- ✅ Business Rules
- Sometimes: External Dependencies
- ❌ Side Effects, Lifecycle Management, Inbound/Outbound communications

### Sagas (Domain/Application)
- ✅ External Dependencies, Transaction Management, Error Handling, Side Effects
- Often: Business Rules, Outbound communication

### Adapters (Infrastructure)
- ✅ Outbound communication, External Dependencies, Transformations, Error Handling
- Often: Side Effects
- ❌ Business Rules, Invariants

### Projections (Infrastructure)
- ✅ Event Mapping, Inbound communication, Side Effects, External Dependencies
- Often: Idempotency, Transformations
- ❌ Business Rules, Invariants

### Read Models (Infrastructure)
- ✅ Transformations
- Sometimes: External Dependencies
- ❌ Business Rules, Domain Events, Side Effects, Inbound communication

### Simple DTOs/Commands
- All columns empty ❌

---

## Important Classification Notes

- **ONLY mark columns with ✓** - never add text descriptions
- **Value Objects NEVER have Identity Management** (use structural equality)
- **Integration Events ≠ Domain Events** (different layers and purposes)
- **Enums have Invariants ONLY if** they contain validation logic (init blocks, factory methods)
- **Simple DTOs** typically have all columns empty
- **For enums/validators**: Always include specific values, constraints in description
- **Description length**: 15-60 words, functional focus, business context

---

## Quick Validation Checklist

Before finalizing classification, verify:
- [ ] Simple DTOs/commands have all columns ❌
- [ ] Value Objects never have Identity Management
- [ ] Aggregates coordinating children have Aggregate Consistency ✓
- [ ] Services with repositories have External Dependencies ✓
- [ ] Services with @Transactional have Transaction Management ✓
- [ ] Event consumers filtering external data have Integration Rules ✓
- [ ] Event consumers translating events have Event Mapping ✓
- [ ] Any I/O operations have Side Effects ✓
- [ ] Init blocks with require() have Invariants ✓
- [ ] Service-level validations have Business Rules ✓
- [ ] Controllers/REST endpoints have Inbound communication ✓
- [ ] Message consumers/event listeners have Inbound communication ✓
- [ ] API clients/HTTP calls have Outbound communication ✓
- [ ] API clients implementing port interfaces have External Dependencies ✓
- [ ] API clients with retry/timeout logic have Error Handling ✓
- [ ] Event publishers/message producers have Outbound communication ✓
- [ ] Integration event classes have Integration event ✓
- [ ] Classes with layer violations marked as Possible outsider ✓
