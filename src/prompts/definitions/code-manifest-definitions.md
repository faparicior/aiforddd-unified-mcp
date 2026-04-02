# Invariants and Business Rules Classification Guide

## Purpose
This document provides clear definitions and examples to help AI agents correctly identify and classify **Invariants**, **Business Rules**, **Validation Rules**, **Integration Rules**, and **additional DDD aspects** when cataloging classes in `code_manifest.md`.

## Core Definitions

### Invariant
An **invariant** is a condition that **must always be true** to maintain the structural integrity and consistency of the domain model. Invariants are:
- **Immutable truths** about the domain
- **Enforced at the object/entity level** (constructors, setters, methods)
- **Independent of business policies** or context
- **Critical for data validity** - violating them makes the object invalid
- **Part of the Domain layer**

**Key characteristic**: If violated, the object enters an invalid state.

**Where validated**: Domain entities, value objects, aggregates.

**Important note on Enums**: Enums can have invariants if they enforce validation logic:
- ✅ **Has Invariants**: Enums with constructor validation, factory methods that validate input, or init blocks with require statements
- ❌ **No Invariants**: Simple enums that just define allowed values without validation logic

Examples:
```kotlin
// HAS Invariants - validates input
enum class Status(val value: String) {
    ACTIVE("active"), INACTIVE("inactive");
    companion object {
        fun fromString(input: String) = entries.find { it.value == input }
            ?: throw IllegalArgumentException("Invalid status") // Invariant enforcement
    }
}

// NO Invariants - just defines values
enum class Color { RED, GREEN, BLUE }
```

### Business Rule
A **business rule** is a condition, restriction, or logic that reflects **how the business operates**. Business rules are:
- **Subject to change** based on policies or requirements
- **Context-dependent** - may vary by scenario
- **Enforced at the service/use case level**
- **About workflows and behavior**, not just data validity
- **Part of the Domain/Application layer**

**Key characteristic**: If violated, it's a business policy violation, not data corruption.

**Where validated**: Domain services, application services, use cases.

### Validation Rule
A **validation rule** is a technical constraint that ensures **data format correctness** at the boundaries of the system. Validation rules are:
- **Technical/syntactic** validations (type checking, format validation)
- **Not part of the domain model** - belong to infrastructure/application layers
- **Enforced before domain processing** (input sanitization)
- **About data shape and technical correctness**
- **Part of the Application/Infrastructure layer**

**Key characteristic**: Validates technical format, not business meaning.

**Where validated**: Mappers, controllers, DTOs with annotations, request validators.

**Examples**:
- `accountNumber` must be an integer
- `emailAddress` field must be a valid string format
- JSON payload must be parseable
- Request parameter must be numeric
- Date field must be in ISO-8601 format

### Integration Rule
An **integration rule** is a constraint that **protects the domain** from external systems or enforces **anti-corruption layer** policies. Integration rules are:
- **Boundary protection** - filter/reject incompatible external data
- **Not part of core domain logic** - belong to infrastructure
- **Enforced at integration points** (consumers, adapters)
- **About external system compatibility**
- **Part of the Infrastructure layer**

**Key characteristic**: Acts as a gatekeeper between external systems and the domain.

**Where validated**: Event consumers, anti-corruption layers, external API adapters.

**Examples**:
- Reject events with `source != "trusted-system"`
- Only process messages from specific channels
- Filter out events from unsupported API versions
- Discard messages with unknown event types
- Accept only events with valid correlation IDs

### Factory/Creation Logic
**Factory/Creation Logic** refers to methods or patterns that facilitate object construction with predefined default values or specific creation strategies. This logic:
- **Simplifies object instantiation** with sensible defaults
- **Does not contain complex business rules** - only initialization
- **Found in companion objects, factory methods, or builder patterns**
- **Acceptable in Value Objects and Entities** when kept simple
- **Part of the Domain layer**

**Key characteristic**: Helps create objects with proper initial state, but doesn't validate business policies.

**Where found**: Companion objects with factory methods, Builder patterns, Factory classes.

**Examples**:
- `defaultCertificate()` that creates a certificate with UNDEFINED values
- `Email.fromString()` factory method
- `Money.zero(currency)` helper method
- `Order.createDraft()` initialization method

### Transformations
**Transformations** are operations that convert, calculate, or derive data from existing values. Transformations:
- **Convert between representations** (units, formats, currencies)
- **Calculate derived values** (totals, percentages, scores)
- **Map between domain concepts** (entity to DTO, domain to external format)
- **Should be pure functions** without side effects when in domain
- **Part of Domain or Infrastructure layer** depending on purpose

**Key characteristic**: Takes input and produces output through calculation or conversion.

**Where found**: Value objects with conversion methods, mappers, calculators, formatters.

**Examples**:
- Converting coordinates (latitude/longitude deflection)
- Currency conversion
- Unit conversion (meters to feet)
- Calculating product scoring from multiple factors
- Formatting dates or numbers

### Identity Management
**Identity Management** refers to how an object establishes and maintains its unique identity. This aspect:
- **Only applies to Entities and Aggregates**, not Value Objects
- **Defines equality based on ID**, not attributes
- **Manages ID generation** (auto-generated, UUID, composite keys)
- **Part of the Domain layer**

**Key characteristic**: Entities with same ID are considered the same, even if attributes differ.

**Where found**: Entities, Aggregates with ID properties and equality overrides.

**Examples**:
- `Order` with `OrderId` property
- `Customer` with auto-generated database ID
- `Ad` with composite key (transactionType + propertyId)
- Override of `equals()` and `hashCode()` based on ID

### Lifecycle Management
**Lifecycle Management** refers to how an object transitions through different states during its existence. This aspect:
- **Manages state transitions** (Draft → Submitted → Approved)
- **Enforces valid state changes** (can only cancel if not shipped)
- **Triggers actions on state changes** (emit events, update timestamps)
- **Only applies to Entities and Aggregates**
- **Part of the Domain layer**

**Key characteristic**: Objects have states and rules about how they can transition.

**Where found**: Entities/Aggregates with status/state properties and transition methods.

**Examples**:
- `Order.submit()` changes status from DRAFT to SUBMITTED
- `Ad.publish()` transitions from PENDING to PUBLISHED
- `Subscription.cancel()` moves to CANCELLED state
- State machine implementations

### Domain Events
**Domain Events** are notifications about something significant that happened in the domain. Domain events:
- **Represent business occurrences** (OrderPlaced, PaymentReceived)
- **Emitted by Aggregates** to notify other parts of the system
- **Are immutable** and represent past facts
- **Enable loose coupling** between bounded contexts
- **Part of the Domain layer**

**Key characteristic**: "Something important happened" notifications from the domain.

**Where found**: Aggregates that emit events, event classes themselves.

**Examples**:
- `OrderPlacedEvent` emitted when order is submitted
- `PriceChangedEvent` when product price updates
- `AdPublishedEvent` when ad becomes visible
- Event sourcing implementations

### Aggregate Consistency
**Aggregate Consistency** refers to maintaining invariants and business rules across the aggregate boundary. This aspect:
- **Ensures transactional consistency** within aggregate
- **Enforces aggregate-wide invariants** (order total matches items)
- **Coordinates child entities** (order manages order items)
- **Only applies to Aggregate Roots**
- **Part of the Domain layer**

**Key characteristic**: The aggregate root is responsible for maintaining consistency of all entities within its boundary.

**Where found**: Aggregate root entities managing collections of child entities.

**Examples**:
- `Order` ensuring all `OrderItems` have valid quantities
- `ShoppingCart` recalculating totals when items change
- `Invoice` ensuring line items sum to total
- Aggregate enforcing maximum item count

### External Dependencies
**External Dependencies** refer to integration with external services or systems from within the domain. This aspect:
- **Indicates dependency on external APIs** or services
- **Should be abstracted through interfaces** (ports)
- **Can violate pure domain principles** if not careful
- **Typically found in Domain Services** calling infrastructure
- **Part of Domain/Application layer**

**Key characteristic**: The class needs something from outside the application to do its job.

**Where found**: Domain services with repository/API dependencies, application services orchestrating external calls.

**Examples**:
- Domain service calling geocoding API
- Service fetching data from external product catalog
- Integration with payment gateway
- Calling third-party validation service

### Event Mapping
**Event Mapping** refers to converting between external event formats and domain models. This aspect:
- **Translates external events to domain objects**
- **Anti-corruption layer responsibility**
- **Protects domain from external format changes**
- **Part of Infrastructure layer**

**Key characteristic**: Bridges the gap between external event schema and internal domain model.

**Where found**: Event consumers, event adapters, anti-corruption layers.

**Examples**:
- Kafka event DTO → Domain entity
- External API event → Domain event
- Legacy system message → Domain command
- Protocol buffer → Domain object

### Error Handling
**Error Handling** refers to how a class manages and responds to error conditions. This aspect:
- **Manages failure scenarios** (retry, circuit breaker, fallback)
- **Handles infrastructure failures** (network, database)
- **Typically Infrastructure/Application concern**
- **Part of Infrastructure/Application layer**

**Key characteristic**: Defines what happens when things go wrong.

**Where found**: Consumers, adapters, application services, infrastructure services.

**Examples**:
- Retry logic for failed API calls
- Dead letter queue for failed event processing
- Circuit breaker for external service calls
- Fallback values when external system unavailable

### Idempotency
**Idempotency** refers to the ability to process the same request/event multiple times with the same result. This aspect:
- **Prevents duplicate processing** (same event consumed twice)
- **Critical for event-driven systems**
- **Typically uses idempotency keys** or deduplication logic
- **Part of Infrastructure/Application layer**

**Key characteristic**: Processing the same input multiple times has the same effect as processing it once.

**Where found**: Event consumers, API handlers, command handlers.

**Examples**:
- Checking if event ID already processed
- Using database constraints to prevent duplicates
- Idempotent API endpoints (PUT, DELETE)
- Deduplication based on correlation ID

### Side Effects
**Side Effects** refer to actions that change state outside the function/method scope. This aspect:
- **Includes I/O operations** (database writes, API calls, file writes)
- **Event publishing** to message brokers
- **External system notifications**
- **Should be minimized in Value Objects** (ideally none)
- **Expected in Services and Infrastructure**

**Key characteristic**: The method does more than just calculate and return a value.

**Where found**: Services, repositories, consumers, adapters.

**Examples**:
- Saving to database
- Publishing events to Kafka
- Sending emails or SMS
- Calling external APIs
- Logging (minor side effect)

### Transaction Management
**Transaction Management** refers to coordinating database or distributed transactions. This aspect:
- **Ensures ACID properties** for database operations
- **Manages commit/rollback**
- **Handles distributed transactions** (saga pattern)
- **Part of Infrastructure/Application layer**

**Key characteristic**: Coordinates multiple operations to succeed or fail together.

**Where found**: Application services, repository implementations, transaction managers.

**Examples**:
- `@Transactional` annotation usage
- Explicit transaction begin/commit/rollback
- Saga orchestration for distributed transactions
- Two-phase commit implementations

---

## Decision Framework

Ask these questions to classify:

| Question | If YES → | If NO → |
|----------|----------|---------|
| Does it validate the structural integrity of the object? | Invariant | Business Rule / Validation Rule |
| Would violating it make the object fundamentally invalid? | Invariant | Business Rule |
| Is it enforced in constructors/value objects/entities? | Likely Invariant | Likely Business Rule / Validation Rule |
| Does it involve multiple aggregates or external systems? | Business Rule / Integration Rule | Could be Invariant |
| Could this rule change based on business policy? | Business Rule | Likely Invariant |
| Is it about "what can exist" vs "what can happen"? | Invariant | Business Rule |
| Is it purely technical/format validation? | Validation Rule | Invariant / Business Rule |
| Is it enforced in mappers/controllers/DTOs? | Validation Rule | Likely Domain Rule |
| Does it filter/reject external system data? | Integration Rule | Other type |
| Is it in an anti-corruption layer or consumer? | Integration Rule | Other type |

---

## Extended Classification Rules for code_manifest.md

**IMPORTANT**: Only mark columns with ✓ - do not add text descriptions to any column.

### When to mark the "Factory/Creation Logic" column with ✓:
✅ The class has **factory methods or companion object factories**
✅ Contains **methods that create instances with default values**
✅ Builder pattern implementations
✅ The logic is **simple initialization**, not complex business rules
✅ Found in **Domain layer** (Value Objects, Entities, Aggregates)

### When to mark the "Transformations" column with ✓:
✅ The class **converts between formats or representations**
✅ Performs **calculations or derivations** from existing data
✅ Maps between domain models and external formats
✅ Conversion methods like `toDto()`, `toDomain()`, `format()`
✅ Mathematical transformations (scoring, percentages, unit conversion)

### When to mark the "Identity Management" column with ✓:
✅ The class is an **Entity or Aggregate** with identity
✅ Has an **ID property** that defines equality
✅ Overrides `equals()` and `hashCode()` based on ID
✅ **Never for Value Objects** (they use structural equality)

### When to mark the "Lifecycle Management" column with ✓:
✅ The class has **state/status transitions**
✅ Methods that **change the object's lifecycle state** (submit, approve, cancel)
✅ Enforces **valid state transition rules**
✅ Found in **Entities and Aggregates**

### When to mark the "Domain Events" column with ✓:
✅ The class **emits domain events**
✅ The class **is itself a domain event**
✅ Found in **Aggregates** (emitters) or event packages (event classes)
✅ Represents **significant business occurrences**

### When to mark the "Aggregate Consistency" column with ✓:
✅ The class is an **Aggregate Root**
✅ Manages **child entities** and enforces consistency
✅ Ensures **aggregate-wide invariants**
✅ Coordinates operations across multiple entities within boundary

### When to mark the "External Dependencies" column with ✓:
✅ The class **depends on external services or APIs**
✅ Uses **repositories, HTTP clients, or message brokers**
✅ Typically **Domain Services or Application Services**
✅ Dependencies abstracted through **ports/interfaces**

### When to mark the "Event Mapping" column with ✓:
✅ The class **converts external events to domain models**
✅ Found in **event consumers or anti-corruption layers**
✅ Translates between **external event schemas and domain**
✅ **Infrastructure layer** responsibility

### When to mark the "Error Handling" column with ✓:
✅ The class has **explicit error handling logic** (try/catch, retry, fallback)
✅ Implements **resilience patterns** (circuit breaker, timeout)
✅ Manages **recovery from failures**
✅ Typically **Infrastructure or Application layer**

### When to mark the "Idempotency" column with ✓:
✅ The class **implements idempotency checks**
✅ Prevents **duplicate processing** of same input
✅ Uses **idempotency keys or deduplication**
✅ Typically **event consumers or API handlers**

### When to mark the "Side Effects" column with ✓:
✅ The class **performs I/O operations** (database, file, network)
✅ **Publishes events** or sends messages
✅ **Calls external systems**
✅ **NOT for pure calculation methods**

### When to mark the "Transaction Management" column with ✓:
✅ The class **manages database transactions**
✅ Uses `@Transactional` annotations
✅ Implements **saga or distributed transaction patterns**
✅ Explicit **commit/rollback logic**

---

## Layer-Based Classification Table (Extended)

| Aspect | Layer | Found In | Applies To |
|--------|-------|----------|------------|
| **Invariants** | Domain | Entity/Value Object/Aggregate | All domain objects with validation |
| **Business Rules** | Domain/Application | Service/Use Case/Aggregate | Services, Entities, Aggregates |
| **Validation Rules** | Application/Infrastructure | Mapper/Controller/DTO | DTOs, Mappers, Controllers |
| **Integration Rules** | Infrastructure | Consumer/Adapter/ACL | Consumers, Adapters |
| **Factory/Creation Logic** | Domain | Companion object/Factory | Value Objects, Entities |
| **Transformations** | Domain/Infrastructure | Value Object/Mapper | Converters, Calculators |
| **Identity Management** | Domain | Entity/Aggregate | Entities, Aggregates only |
| **Lifecycle Management** | Domain | Entity/Aggregate | Entities, Aggregates only |
| **Domain Events** | Domain | Aggregate/Event | Aggregates, Event classes |
| **Aggregate Consistency** | Domain | Aggregate Root | Aggregate Roots only |
| **External Dependencies** | Domain/Application/Infrastructure | Domain Service/App Service/API Client | Services with external calls, API clients, gateways |
| **Event Mapping** | Infrastructure | Consumer/Adapter | Event Consumers, ACL |
| **Error Handling** | Infrastructure/Application | Service/Consumer | Services, Consumers |
| **Idempotency** | Infrastructure/Application | Consumer/Handler | Event Consumers, API Handlers |
| **Side Effects** | Domain/Infrastructure | Service/Repository | Services, Repositories |
| **Transaction Management** | Infrastructure/Application | Service/Repository | Application Services |
| **Event Handler (DDD)** | Application | Event handler class | Application services consuming domain/integration events |
| **Factory (DDD)** | Domain | Factory/Builder class | Domain entities requiring complex instantiation |
| **Specification (DDD)** | Domain | Specification/Criteria class | Domain services filtering or validating domain objects |
| **Policy (DDD)** | Domain | Policy/Strategy class | Domain services with context-dependent business decisions |
| **Saga (DDD)** | Domain/Application | Saga orchestrator | Distributed workflow coordinators across aggregates |
| **Mapper (DDD)** | Infrastructure | Mapper class | Domain-to-DTO and DTO-to-domain transformations |
| **Adapter (DDD)** | Infrastructure | Adapter/Wrapper class | External system adapters implementing domain interfaces |
| **Projection (DDD)** | Infrastructure | Projection handler | CQRS read side builders consuming domain events |
| **Read Model (DDD)** | Infrastructure | Read model class | CQRS query side optimized views |

---

## Complete Classification Example

### Example: Certificate Value Object

```kotlin
data class Certificate(
    val status: CertificateStatus,
    val type: CertificateType,
    val rating: Rating,
    val expiryDate: LocalDate?
) {
    companion object {
        fun createDefault() = Certificate(
            status = CertificateStatus.PENDING,
            type = CertificateType.STANDARD,
            rating = Rating.UNRATED,
            expiryDate = null
        )
    }
}
```

**Complete Classification:**

| Aspect | Has It? | Justification |
|--------|---------|---------------|
| **Invariants** | ❌ | No validation in init block or constructors |
| **Business Rules** | ❌ | No complex business logic |
| **Validation Rules** | ❌ | No technical format validation |
| **Integration Rules** | ❌ | Not in infrastructure boundary |
| **Factory/Creation Logic** | ✅ | Has `createDefault()` factory method |
| **Transformations** | ❌ | No conversion or calculation methods |
| **Identity Management** | ❌ | Value Object - uses structural equality |
| **Lifecycle Management** | ❌ | Immutable - no state transitions |
| **Domain Events** | ❌ | Does not emit events |
| **Aggregate Consistency** | ❌ | Not an aggregate |
| **External Dependencies** | ❌ | No external service dependencies |
| **Event Mapping** | ❌ | Not involved in event translation |
| **Error Handling** | ❌ | No error handling logic |
| **Idempotency** | ❌ | Not applicable |
| **Side Effects** | ❌ | Pure data class with pure factory method |
| **Transaction Management** | ❌ | No transaction coordination |

---

## Examples

### ✅ GOOD Example 1: Value Object with Invariant

```kotlin
data class AccountNumber(val value: String) {
    init {
        require(value.matches(ACCOUNT_REGEX)) { "Invalid account number format" }
        require(value.length == 10) { "Account number must be exactly 10 digits" }
    }
    
    companion object {
        private val ACCOUNT_REGEX = "^[0-9]{10}$".toRegex()
    }
}
```

**Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ✅
- **Business Rules**: ❌
- **Factory/Creation Logic**: ❌
- **Transformations**: ❌
- **Identity Management**: ❌
- **Lifecycle Management**: ❌
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ❌
- **Event Mapping**: ❌
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ❌
- **Transaction Management**: ❌

**Reasoning**: Validates structural integrity - an account number without valid format is fundamentally invalid.

---

### ✅ GOOD Example 2: Entity with Invariants and Business Rules

```kotlin
class Subscription(
    val id: SubscriptionId,
    val userId: UserId,
    private var status: SubscriptionStatus,
    private val plan: Plan
) {
    init {
        require(id.value.isNotBlank()) { "Subscription ID cannot be blank" }
        require(userId.value > 0) { "User ID must be positive" }
    }
    
    fun upgrade(newPlan: Plan) {
        require(status == SubscriptionStatus.ACTIVE) { "Only active subscriptions can be upgraded" }
        require(newPlan.tier > plan.tier) { "New plan must be higher tier" }
        // ... upgrade logic
    }
}
```

**Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ✅
- **Business Rules**: ✅
- **Factory/Creation Logic**: ❌
- **Transformations**: ❌
- **Identity Management**: ✅
- **Lifecycle Management**: ✅
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ❌
- **Event Mapping**: ❌
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ❌
- **Transaction Management**: ❌

**Reasoning**: 
- ID validation = structural integrity (invariants)
- Upgrade restrictions and tier logic = business workflow (business rules)
- Entity with ID property (identity management)
- Status-based transitions = lifecycle management

---

### ✅ GOOD Example 3: Service with Business Rules

```kotlin
class ProcessPaymentService(
    private val accountRepository: AccountRepository,
    private val userRepository: UserRepository,
    private val fraudDetector: FraudDetector
) {
    fun execute(command: ProcessPaymentCommand) {
        val user = userRepository.findById(command.userId)
            ?: throw UserNotFoundException()
        
        if (!user.isVerified()) {
            throw UnverifiedUserException()
        }
        
        if (user.hasOverduePayments()) {
            throw OverduePaymentsException()
        }
        
        val account = accountRepository.findById(command.accountId)
            ?: throw AccountNotFoundException()
        
        if (!fraudDetector.isLegitimate(command)) {
            throw FraudDetectedException()
        }
        
        account.processPayment(command.amount)
        accountRepository.save(account)
    }
}
```

**Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ❌
- **Business Rules**: ✅
- **Factory/Creation Logic**: ❌
- **Transformations**: ❌
- **Identity Management**: ❌
- **Lifecycle Management**: ❌
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ✅
- **Event Mapping**: ❌
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ✅
- **Transaction Management**: ✅

**Reasoning**: 
- All validations are business policies that could change (business rules)
- Depends on repositories and fraud detector (external dependencies)
- Saves to database (side effects)
- Coordinates multiple operations (transaction management)

---

### ✅ GOOD Example 4: DTO (No Rules)

```kotlin
data class CreateUserRequest(
    val username: String,
    val email: String,
    val preferredLanguage: String
)
```

**Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ❌
- **Business Rules**: ❌
- **Factory/Creation Logic**: ❌
- **Transformations**: ❌
- **Identity Management**: ❌
- **Lifecycle Management**: ❌
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ❌
- **Event Mapping**: ❌
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ❌
- **Transaction Management**: ❌

**Reasoning**: Simple data transfer object with no validation or logic.

---

### ✅ GOOD Example 5: Exception Class with Invariant Context

```kotlin
class NegativeBalanceException(balance: BigDecimal) : 
    RuntimeException("Balance cannot be negative, received: $balance")
```

**Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ✅
- **Business Rules**: ❌
- **Factory/Creation Logic**: ❌
- **Transformations**: ❌
- **Identity Management**: ❌
- **Lifecycle Management**: ❌
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ❌
- **Event Mapping**: ❌
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ❌
- **Transaction Management**: ❌

**Reasoning**: Exception indicates invariant violation (though the invariant itself is in another class).

---

### ✅ GOOD Example 6: Validation Rule in Mapper

```kotlin
class UserRequestMapper {
    fun toCommand(request: CreateUserRequest): CreateUserCommand {
        val age = request.age?.toIntOrNull()
            ?: throw ValidationException("age must be a valid integer")
        
        val registrationDate = request.registrationDate?.let { LocalDate.parse(it) }
            ?: throw ValidationException("registrationDate must be valid ISO-8601 format")
        
        if (request.username.isNullOrBlank()) {
            throw ValidationException("username cannot be empty")
        }
        
        return CreateUserCommand(
            username = request.username,
            age = age,
            registrationDate = registrationDate
        )
    }
}
```

**Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ✅
- **Invariants**: ❌
- **Business Rules**: ❌
- **Factory/Creation Logic**: ❌
- **Transformations**: ❌
- **Identity Management**: ❌
- **Lifecycle Management**: ❌
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ❌
- **Event Mapping**: ❌
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ❌
- **Transaction Management**: ❌

**Reasoning**: Technical format validation in infrastructure layer, not domain rules.

---

### ✅ GOOD Example 7: Integration Rule in Consumer

```kotlin
@Component
class NotificationEventConsumer(
    private val processNotificationUseCase: ProcessNotificationUseCase
) {
    @KafkaListener(topics = ["notification-events"])
    fun consume(event: NotificationEvent) {
        // Integration Rule: Only process events from trusted source
        if (event.source != "notification-service") {
            logger.info("Rejecting event from untrusted source: ${event.source}")
            return
        }
        
        // Integration Rule: Only process supported event versions
        if (event.version !in SUPPORTED_VERSIONS) {
            logger.warn("Unsupported event version: ${event.version}")
            return
        }
        
        // Integration Rule: Only process known event types
        if (event.type !in SUPPORTED_EVENT_TYPES) {
            logger.warn("Unknown event type: ${event.type}")
            return
        }
        
        processNotificationUseCase.execute(event.toDomain())
    }
    
    companion object {
        private val SUPPORTED_VERSIONS = setOf("v1", "v2")
        private val SUPPORTED_EVENT_TYPES = setOf("email", "sms", "push")
    }
}
```

**Classification:**
- **Integration Rules**: ✅
- **Validation Rules**: ❌
- **Invariants**: ❌
- **Business Rules**: ❌
- **Factory/Creation Logic**: ❌
- **Transformations**: ❌
- **Identity Management**: ❌
- **Lifecycle Management**: ❌
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ❌
- **Event Mapping**: ✅
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ❌
- **Transaction Management**: ❌

**Reasoning**: Anti-corruption layer protecting domain from external system variations through filtering rules and event translation.

---

### ✅ GOOD Example 8: Distinguishing All Four Core Types

```kotlin
// VALIDATION RULE (Infrastructure - Mapper)
class ItemRequestMapper {
    fun toCommand(request: CreateItemRequest): CreateItemCommand {
        // Validation Rule: technical format check
        val price = request.price?.toBigDecimalOrNull()
            ?: throw ValidationException("price must be a valid decimal number")
        
        val quantity = request.quantity?.toIntOrNull()
            ?: throw ValidationException("quantity must be a valid integer")
        
        return CreateItemCommand(
            price = price,
            quantity = quantity,
            name = request.name
        )
    }
}

// INVARIANT (Domain - Value Object)
data class Price(val amount: BigDecimal, val currency: String) {
    init {
        // Invariant: structural integrity
        require(amount >= BigDecimal.ZERO) { "Amount cannot be negative" }
        require(amount.scale() <= 2) { "Amount cannot have more than 2 decimal places" }
        require(currency.length == 3) { "Currency must be 3-letter ISO code" }
    }
}

// BUSINESS RULE (Domain - Entity)
class Item(
    val id: ItemId,
    private var price: Price,
    private var status: ItemStatus
) {
    fun updatePrice(newPrice: Price) {
        // Business Rule: business policy
        require(status == ItemStatus.ACTIVE) { 
            "Cannot update price of inactive item" 
        }
        
        // Business Rule: business policy
        val priceChange = (newPrice.amount - price.amount).abs()
        val maxChange = price.amount * BigDecimal("0.20") // 20% max change
        require(priceChange <= maxChange) { 
            "Price change exceeds 20% limit" 
        }
        
        price = newPrice
    }
}

// INTEGRATION RULE (Infrastructure - Consumer)
class ItemEventConsumer {
    fun consume(event: ExternalItemEvent) {
        // Integration Rule: boundary protection
        if (event.source != "inventory-api") {
            logger.info("Ignoring event from external source: ${event.source}")
            return
        }
        
        // Integration Rule: version compatibility
        if (event.schemaVersion < MIN_SUPPORTED_VERSION) {
            logger.warn("Event version too old: ${event.schemaVersion}")
            return
        }
        
        // ... process event
    }
    
    companion object {
        private const val MIN_SUPPORTED_VERSION = 2
    }
}
```

**Classifications:**

**ItemRequestMapper**:
- **Integration Rules**: ❌
- **Validation Rules**: ✅
- **Invariants**: ❌
- **Business Rules**: ❌
- **Factory/Creation Logic**: ❌
- **Transformations**: ❌
- **Identity Management**: ❌
- **Lifecycle Management**: ❌
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ❌
- **Event Mapping**: ❌
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ❌
- **Transaction Management**: ❌

**Price**:
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ✅
- **Business Rules**: ❌
- **Factory/Creation Logic**: ❌
- **Transformations**: ❌
- **Identity Management**: ❌
- **Lifecycle Management**: ❌
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ❌
- **Event Mapping**: ❌
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ❌
- **Transaction Management**: ❌

**Item**:
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ❌
- **Business Rules**: ✅
- **Factory/Creation Logic**: ❌
- **Transformations**: ❌
- **Identity Management**: ✅
- **Lifecycle Management**: ✅
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ❌
- **Event Mapping**: ❌
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ❌
- **Transaction Management**: ❌

**ItemEventConsumer**:
- **Integration Rules**: ✅
- **Validation Rules**: ❌
- **Invariants**: ❌
- **Business Rules**: ❌
- **Factory/Creation Logic**: ❌
- **Transformations**: ❌
- **Identity Management**: ❌
- **Lifecycle Management**: ❌
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ❌
- **Event Mapping**: ✅
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ❌
- **Transaction Management**: ❌

---

### ✅ GOOD Example 9: Factory/Creation Logic

```kotlin
data class Address(
    val street: String,
    val city: String,
    val postalCode: String,
    val country: String
) {
    companion object {
        fun createEmpty() = Address(
            street = "",
            city = "",
            postalCode = "",
            country = "US"
        )
        
        fun createFromComponents(street: String, city: String, postalCode: String): Address {
            return Address(
                street = street,
                city = city,
                postalCode = postalCode,
                country = "US" // default
            )
        }
    }
}
```

**Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ❌
- **Business Rules**: ❌
- **Factory/Creation Logic**: ✅
- **Transformations**: ❌
- **Identity Management**: ❌
- **Lifecycle Management**: ❌
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ❌
- **Event Mapping**: ❌
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ❌
- **Transaction Management**: ❌

**Reasoning**: Provides convenient factory methods for creating instances with defaults.

---

### ✅ GOOD Example 10: Transformations

```kotlin
data class Distance(val meters: Double) {
    fun toKilometers(): Double = meters / 1000.0
    
    fun toMiles(): Double = meters / 1609.34
    
    fun add(other: Distance): Distance = Distance(meters + other.meters)
    
    companion object {
        fun fromKilometers(km: Double) = Distance(km * 1000.0)
        fun fromMiles(miles: Double) = Distance(miles * 1609.34)
    }
}
```

**Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ❌
- **Business Rules**: ❌
- **Factory/Creation Logic**: ✅
- **Transformations**: ✅
- **Identity Management**: ❌
- **Lifecycle Management**: ❌
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ❌
- **Event Mapping**: ❌
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ❌
- **Transaction Management**: ❌

**Reasoning**: Converts between different units and provides factory methods for different input formats.

---

### ✅ GOOD Example 11: Aggregate with Multiple Aspects

```kotlin
class ShoppingCart(
    val id: CartId,
    private val items: MutableList<CartItem> = mutableListOf(),
    private var status: CartStatus = CartStatus.ACTIVE
) {
    init {
        require(id.value.isNotBlank()) { "Cart ID cannot be blank" }
    }
    
    fun addItem(item: CartItem) {
        require(status == CartStatus.ACTIVE) { "Cannot add items to inactive cart" }
        require(items.size < MAX_ITEMS) { "Cart cannot exceed maximum items" }
        items.add(item)
    }
    
    fun checkout() {
        require(status == CartStatus.ACTIVE) { "Can only checkout active carts" }
        require(items.isNotEmpty()) { "Cannot checkout empty cart" }
        status = CartStatus.CHECKED_OUT
        DomainEvents.raise(CartCheckedOutEvent(id, total()))
    }
    
    fun total(): BigDecimal = items.sumOf { it.price.amount * it.quantity.toBigDecimal() }
    
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is ShoppingCart) return false
        return id == other.id
    }
    
    override fun hashCode(): Int = id.hashCode()
    
    companion object {
        private const val MAX_ITEMS = 100
    }
}
```

**Classification:**
- **Invariants**: ✅
- **Business Rules**: ✅
- **Identity Management**: ✅
- **Lifecycle Management**: ✅
- **Domain Events**: ✅
- **Aggregate Consistency**: ✅
- **Transformations**: ✅

**Reasoning**: 
- Cart ID validation (invariants)
- Business constraints on adding items and checkout (business rules)
- Equality based on ID (identity management)
- Status transitions (lifecycle management)
- Emits events on checkout (domain events)
- Manages child items (aggregate consistency)
- Calculates total (transformations)

---

### ❌ BAD Example 1: Confusing Invariant with Business Rule

```kotlin
class Item(val price: BigDecimal) {
    init {
        require(price >= BigDecimal.ZERO) { "Price cannot be negative" }
        require(price <= BigDecimal("1000000")) { "Price cannot exceed 1 million" }
    }
}
```

**WRONG Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ✅
- **Business Rules**: ❌
- (all other columns): ❌

**CORRECT Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ✅
- **Business Rules**: ✅
- **Factory/Creation Logic**: ❌
- **Transformations**: ❌
- **Identity Management**: ❌
- **Lifecycle Management**: ❌
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ❌
- **Event Mapping**: ❌
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ❌
- **Transaction Management**: ❌

**Reasoning**: 
- Negative price = structural nonsense (invariant)
- Max price limit = business policy that could change (business rule)

---

### ❌ BAD Example 2: Over-classifying Simple DTOs

```kotlin
data class CreateAccountCommand(
    val username: String,
    val email: String,
    val accountType: AccountType
)
```

**WRONG Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ✅
- **Business Rules**: ❌
- (all other columns): ❌

**CORRECT Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ❌
- **Business Rules**: ❌
- **Factory/Creation Logic**: ❌
- **Transformations**: ❌
- **Identity Management**: ❌
- **Lifecycle Management**: ❌
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ❌
- **Event Mapping**: ❌
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ❌
- **Transaction Management**: ❌

**Reasoning**: Kotlin's type system enforces non-nullability. No explicit validation = no entry needed.

---

### ❌ BAD Example 3: Ignoring Actual Business Logic

```kotlin
class TransactionService {
    fun processTransaction(transaction: Transaction) {
        if (transaction.amount > REVIEW_THRESHOLD) {
            // Transactions above threshold require manual review
            throw RequiresManualReviewException()
        }
        // ... process transaction
    }
    
    companion object {
        private val REVIEW_THRESHOLD = BigDecimal("10000.00")
    }
}
```

**WRONG Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ❌
- **Business Rules**: ❌
- (all other columns): ❌

**CORRECT Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ❌
- **Business Rules**: ✅
- **Factory/Creation Logic**: ❌
- **Transformations**: ❌
- **Identity Management**: ❌
- **Lifecycle Management**: ❌
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ❌
- **Event Mapping**: ❌
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ❌
- **Transaction Management**: ❌

**Reasoning**: This is clearly a business policy that affects the workflow.

---

### ❌ BAD Example 4: Missing Factory/Creation Logic

```kotlin
data class Configuration(
    val apiKey: String,
    val timeout: Duration,
    val retries: Int
) {
    companion object {
        fun createDefault() = Configuration(
            apiKey = "",
            timeout = Duration.ofSeconds(30),
            retries = 3
        )
    }
}
```

**WRONG Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ❌
- **Business Rules**: ❌
- **Factory/Creation Logic**: ❌
- (all other columns): ❌

**CORRECT Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ❌
- **Business Rules**: ❌
- **Factory/Creation Logic**: ✅
- **Transformations**: ❌
- **Identity Management**: ❌
- **Lifecycle Management**: ❌
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ❌
- **Event Mapping**: ❌
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ❌
- **Transaction Management**: ❌

**Reasoning**: Has a factory method that creates instances with default values.

---

### ❌ BAD Example 5: Confusing Transformation with Business Rule

```kotlin
data class Temperature(val celsius: Double) {
    fun toFahrenheit(): Double = (celsius * 9/5) + 32
    
    fun toKelvin(): Double = celsius + 273.15
}
```

**WRONG Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ❌
- **Business Rules**: ✅
- (all other columns): ❌

**CORRECT Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ❌
- **Business Rules**: ❌
- **Factory/Creation Logic**: ❌
- **Transformations**: ✅
- **Identity Management**: ❌
- **Lifecycle Management**: ❌
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ❌
- **Event Mapping**: ❌
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ❌
- **Transaction Management**: ❌

**Reasoning**: These are pure mathematical conversions, not business policies.

---

### ❌ BAD Example 6: Missing Side Effects Classification

```kotlin
class NotificationService(
    private val emailClient: EmailClient,
    private val smsClient: SmsClient,
    private val eventPublisher: EventPublisher
) {
    fun sendNotification(notification: Notification) {
        when (notification.type) {
            NotificationType.EMAIL -> emailClient.send(notification)
            NotificationType.SMS -> smsClient.send(notification)
        }
        eventPublisher.publish(NotificationSentEvent(notification.id))
    }
}
```

**WRONG Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ❌
- **Business Rules**: ✅
- (all other columns): ❌

**CORRECT Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ❌
- **Business Rules**: ✅
- **Factory/Creation Logic**: ❌
- **Transformations**: ❌
- **Identity Management**: ❌
- **Lifecycle Management**: ❌
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ✅
- **Event Mapping**: ❌
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ✅
- **Transaction Management**: ❌

**Reasoning**: 
- Channel selection is a business rule
- Uses external clients (external dependencies)
- Sends messages and publishes events (side effects)

---

### ❌ BAD Example 7: Missing Event Mapping

```kotlin
class WebhookConsumer {
    fun consume(event: ExternalWebhookEvent) {
        val domainEvent = convertToDomain(event)
        processEvent(domainEvent)
    }
    
    private fun convertToDomain(event: ExternalWebhookEvent): DomainEvent {
        return DomainEvent(
            id = event.externalId,
            timestamp = Instant.parse(event.timestamp),
            payload = event.data.toPayload()
        )
    }
}
```

**WRONG Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ❌
- **Business Rules**: ❌
- **Factory/Creation Logic**: ❌
- (all other columns): ❌

**CORRECT Classification:**
- **Integration Rules**: ❌
- **Validation Rules**: ❌
- **Invariants**: ❌
- **Business Rules**: ❌
- **Factory/Creation Logic**: ❌
- **Transformations**: ❌
- **Identity Management**: ❌
- **Lifecycle Management**: ❌
- **Domain Events**: ❌
- **Aggregate Consistency**: ❌
- **External Dependencies**: ❌
- **Event Mapping**: ✅
- **Error Handling**: ❌
- **Idempotency**: ❌
- **Side Effects**: ❌
- **Transaction Management**: ❌

**Reasoning**: Explicitly converts external events to domain format.

---

## Focused Examples by Classification Column

This section provides targeted good and bad examples for each classification column to help understand when to mark each aspect.

---

### Integration Rules

#### ✅ GOOD: Consumer filtering untrusted events

```kotlin
class PaymentEventConsumer {
    fun consume(event: PaymentEvent) {
        // Integration Rule: Only accept events from payment gateway
        if (event.source != "payment-gateway") {
            logger.warn("Ignoring event from untrusted source: ${event.source}")
            return
        }
        
        // Integration Rule: Only process known payment types
        if (event.paymentType !in SUPPORTED_PAYMENT_TYPES) {
            logger.warn("Unsupported payment type: ${event.paymentType}")
            return
        }
        
        processPayment(event)
    }
    
    companion object {
        private val SUPPORTED_PAYMENT_TYPES = setOf("CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER")
    }
}
```

**Why Integration Rules**: ✅ Protects domain by filtering external system data at the boundary.

#### ❌ BAD: Confusing with Validation Rules

```kotlin
class OrderService {
    fun createOrder(command: CreateOrderCommand) {
        // This is NOT an Integration Rule - it's domain validation
        require(command.items.isNotEmpty()) { "Order must have items" }
        require(command.totalAmount > BigDecimal.ZERO) { "Total must be positive" }
        
        // ... create order
    }
}
```

**Why NOT Integration Rules**: ❌ This is domain-level validation, not boundary protection from external systems.

---

### Validation Rules

#### ✅ GOOD: Mapper with technical format validation

```kotlin
class ProductRequestMapper {
    fun toCommand(request: CreateProductRequest): CreateProductCommand {
        // Validation Rule: technical format check
        val price = request.price?.toBigDecimalOrNull()
            ?: throw ValidationException("price must be a valid decimal number")
        
        // Validation Rule: date format check
        val launchDate = try {
            LocalDate.parse(request.launchDate)
        } catch (e: DateTimeParseException) {
            throw ValidationException("launchDate must be in ISO-8601 format")
        }
        
        // Validation Rule: enum value check
        val category = request.category?.uppercase()?.let {
            try {
                ProductCategory.valueOf(it)
            } catch (e: IllegalArgumentException) {
                throw ValidationException("Invalid category value")
            }
        } ?: throw ValidationException("category is required")
        
        return CreateProductCommand(price, launchDate, category)
    }
}
```

**Why Validation Rules**: ✅ Technical/syntactic validation at system boundaries before domain processing.

#### ❌ BAD: Confusing with Invariants

```kotlin
data class Email(val value: String) {
    init {
        // This is an INVARIANT, not a Validation Rule
        require(value.matches(EMAIL_REGEX)) { "Invalid email format" }
    }
    
    companion object {
        private val EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$".toRegex()
    }
}
```

**Why NOT Validation Rules**: ❌ This is in the domain layer (Value Object) enforcing structural integrity, making it an invariant.

---

### Invariants

#### ✅ GOOD: Value Object with structural integrity validation

```kotlin
data class Quantity(val value: Int) {
    init {
        require(value > 0) { "Quantity must be positive" }
        require(value <= MAX_QUANTITY) { "Quantity exceeds maximum allowed" }
    }
    
    companion object {
        private const val MAX_QUANTITY = 999999
    }
}
```

**Why Invariants**: ✅ Enforces structural integrity - a quantity of 0 or negative is fundamentally invalid.

#### ✅ GOOD: Entity with ID validation

```kotlin
class Customer(
    val id: CustomerId,
    val name: String,
    val email: Email
) {
    init {
        require(id.value.isNotBlank()) { "Customer ID cannot be blank" }
        require(name.isNotBlank()) { "Customer name cannot be blank" }
    }
}
```

**Why Invariants**: ✅ Ensures the entity can never exist in an invalid state.

#### ❌ BAD: Confusing with Business Rules

```kotlin
class Order(val totalAmount: BigDecimal) {
    init {
        // This looks like an invariant but it's actually a business rule
        require(totalAmount >= MIN_ORDER_AMOUNT) {
            "Order must meet minimum amount of $MIN_ORDER_AMOUNT"
        }
    }
    
    companion object {
        private val MIN_ORDER_AMOUNT = BigDecimal("10.00")
    }
}
```

**Why NOT only Invariants**: ⚠️ Minimum order amount is a business policy that can change - this is both an invariant (amount structure) AND a business rule (minimum threshold).

---

### Business Rules

#### ✅ GOOD: Service with business policy logic

```kotlin
class ApplyDiscountService {
    fun execute(order: Order, coupon: Coupon) {
        // Business Rule: Only active orders can have discounts applied
        if (order.status != OrderStatus.ACTIVE) {
            throw InvalidOperationException("Cannot apply discount to ${order.status} order")
        }
        
        // Business Rule: Coupon must not be expired
        if (coupon.isExpired()) {
            throw CouponExpiredException()
        }
        
        // Business Rule: Customer must meet minimum purchase requirement
        if (order.totalAmount < coupon.minimumPurchase) {
            throw MinimumPurchaseNotMetException()
        }
        
        // Business Rule: Maximum discount cap
        val discountAmount = calculateDiscount(order.totalAmount, coupon.percentage)
        val finalDiscount = minOf(discountAmount, coupon.maximumDiscount)
        
        order.applyDiscount(finalDiscount)
    }
}
```

**Why Business Rules**: ✅ All validations are business policies that could change based on business requirements.

#### ❌ BAD: Confusing with Invariants

```kotlin
class BankAccount(var balance: BigDecimal) {
    fun withdraw(amount: BigDecimal) {
        // This is an INVARIANT, not just a business rule
        if (balance - amount < BigDecimal.ZERO) {
            throw InsufficientFundsException()
        }
        balance -= amount
    }
}
```

**Why NOT only Business Rules**: ❌ Preventing negative balance is a structural invariant - the account would be in an invalid state.

---

### Factory/Creation Logic

#### ✅ GOOD: Companion object with factory methods

```kotlin
data class UserProfile(
    val userId: UserId,
    val displayName: String,
    val avatar: String?,
    val preferences: UserPreferences
) {
    companion object {
        fun createDefault(userId: UserId) = UserProfile(
            userId = userId,
            displayName = "User ${userId.value}",
            avatar = null,
            preferences = UserPreferences.default()
        )
        
        fun createFromRegistration(userId: UserId, name: String) = UserProfile(
            userId = userId,
            displayName = name,
            avatar = null,
            preferences = UserPreferences.default()
        )
    }
}
```

**Why Factory/Creation Logic**: ✅ Provides convenient factory methods for creating instances with sensible defaults.

#### ✅ GOOD: Builder pattern

```kotlin
class HttpClient private constructor(
    val baseUrl: String,
    val timeout: Duration,
    val retries: Int,
    val headers: Map<String, String>
) {
    class Builder {
        private var baseUrl: String = ""
        private var timeout: Duration = Duration.ofSeconds(30)
        private var retries: Int = 3
        private var headers: MutableMap<String, String> = mutableMapOf()
        
        fun baseUrl(url: String) = apply { this.baseUrl = url }
        fun timeout(duration: Duration) = apply { this.timeout = duration }
        fun retries(count: Int) = apply { this.retries = count }
        fun header(key: String, value: String) = apply { this.headers[key] = value }
        
        fun build() = HttpClient(baseUrl, timeout, retries, headers.toMap())
    }
    
    companion object {
        fun builder() = Builder()
    }
}
```

**Why Factory/Creation Logic**: ✅ Builder pattern simplifies complex object construction.

#### ❌ BAD: Simple constructor is not factory logic

```kotlin
data class Point(val x: Double, val y: Double)
```

**Why NOT Factory/Creation Logic**: ❌ Just a simple data class with no factory methods or special creation logic.

---

### Transformations

#### ✅ GOOD: Value Object with conversion methods

```kotlin
data class Weight(val grams: Double) {
    fun toKilograms(): Double = grams / 1000.0
    fun toPounds(): Double = grams / 453.592
    fun toOunces(): Double = grams / 28.3495
    
    operator fun plus(other: Weight): Weight = Weight(grams + other.grams)
    operator fun times(factor: Double): Weight = Weight(grams * factor)
    
    companion object {
        fun fromKilograms(kg: Double) = Weight(kg * 1000.0)
        fun fromPounds(lb: Double) = Weight(lb * 453.592)
    }
}
```

**Why Transformations**: ✅ Converts between different units and performs calculations.

#### ✅ GOOD: Mapper converting between layers

```kotlin
class OrderMapper {
    fun toDomain(entity: OrderEntity): Order {
        return Order(
            id = OrderId(entity.id),
            customerId = CustomerId(entity.customerId),
            items = entity.items.map { itemMapper.toDomain(it) },
            total = Money(entity.totalAmount, Currency.getInstance(entity.currency)),
            status = OrderStatus.valueOf(entity.status)
        )
    }
    
    fun toEntity(order: Order): OrderEntity {
        return OrderEntity(
            id = order.id.value,
            customerId = order.customerId.value,
            items = order.items.map { itemMapper.toEntity(it) },
            totalAmount = order.total.amount,
            currency = order.total.currency.currencyCode,
            status = order.status.name
        )
    }
}
```

**Why Transformations**: ✅ Maps between domain models and persistence entities.

#### ❌ BAD: Simple getter is not transformation

```kotlin
class Product(
    val name: String,
    val price: BigDecimal
) {
    fun getName(): String = name  // Not a transformation
    fun getPrice(): BigDecimal = price  // Not a transformation
}
```

**Why NOT Transformations**: ❌ Simple getters don't transform data, they just return it.

---

### Identity Management

#### ✅ GOOD: Entity with ID-based equality

```kotlin
class Product(
    val id: ProductId,
    var name: String,
    var price: Money
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Product) return false
        return id == other.id
    }
    
    override fun hashCode(): Int = id.hashCode()
}
```

**Why Identity Management**: ✅ Entity with ID property and equality based on ID.

#### ✅ GOOD: Aggregate with composite key

```kotlin
class Enrollment(
    val studentId: StudentId,
    val courseId: CourseId,
    var enrolledAt: Instant,
    var status: EnrollmentStatus
) {
    // Composite key for identity
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Enrollment) return false
        return studentId == other.studentId && courseId == other.courseId
    }
    
    override fun hashCode(): Int = Objects.hash(studentId, courseId)
}
```

**Why Identity Management**: ✅ Uses composite key to establish identity.

#### ❌ BAD: Value Object with structural equality

```kotlin
data class Address(
    val street: String,
    val city: String,
    val zipCode: String
)
// Uses default equals() based on all properties
```

**Why NOT Identity Management**: ❌ Value Objects use structural equality, not identity. Two addresses with same values are the same.

---

### Lifecycle Management

#### ✅ GOOD: Entity with state transitions

```kotlin
class Loan(
    val id: LoanId,
    private var status: LoanStatus,
    val amount: Money
) {
    fun approve() {
        require(status == LoanStatus.PENDING) { "Can only approve pending loans" }
        status = LoanStatus.APPROVED
        DomainEvents.raise(LoanApprovedEvent(id))
    }
    
    fun disburse() {
        require(status == LoanStatus.APPROVED) { "Can only disburse approved loans" }
        status = LoanStatus.DISBURSED
        DomainEvents.raise(LoanDisbursedEvent(id))
    }
    
    fun close() {
        require(status in setOf(LoanStatus.DISBURSED, LoanStatus.APPROVED)) {
            "Can only close disbursed or approved loans"
        }
        status = LoanStatus.CLOSED
        DomainEvents.raise(LoanClosedEvent(id))
    }
    
    fun cancel() {
        require(status != LoanStatus.CLOSED) { "Cannot cancel closed loan" }
        status = LoanStatus.CANCELLED
        DomainEvents.raise(LoanCancelledEvent(id))
    }
}

enum class LoanStatus {
    PENDING, APPROVED, DISBURSED, CLOSED, CANCELLED
}
```

**Why Lifecycle Management**: ✅ Manages state transitions with validation and emits events on state changes.

#### ❌ BAD: Immutable Value Object

```kotlin
data class Money(val amount: BigDecimal, val currency: Currency) {
    // Immutable - no state transitions
}
```

**Why NOT Lifecycle Management**: ❌ Value Objects are immutable and don't have lifecycle states.

---

### Domain Events

#### ✅ GOOD: Aggregate emitting domain events

```kotlin
class Subscription(
    val id: SubscriptionId,
    private var status: SubscriptionStatus,
    private var plan: Plan
) {
    fun activate() {
        status = SubscriptionStatus.ACTIVE
        DomainEvents.raise(SubscriptionActivatedEvent(id, plan))
    }
    
    fun cancel(reason: CancellationReason) {
        require(status == SubscriptionStatus.ACTIVE) { "Can only cancel active subscriptions" }
        status = SubscriptionStatus.CANCELLED
        DomainEvents.raise(SubscriptionCancelledEvent(id, reason, Instant.now()))
    }
    
    fun upgrade(newPlan: Plan) {
        val oldPlan = plan
        plan = newPlan
        DomainEvents.raise(SubscriptionUpgradedEvent(id, oldPlan, newPlan))
    }
}
```

**Why Domain Events**: ✅ Aggregate emits domain events when significant business occurrences happen.

#### ✅ GOOD: Domain event class itself

```kotlin
data class OrderPlacedEvent(
    val orderId: OrderId,
    val customerId: CustomerId,
    val totalAmount: Money,
    val items: List<OrderItem>,
    val placedAt: Instant
) : DomainEvent
```

**Why Domain Events**: ✅ The class IS a domain event representing a business occurrence.

#### ❌ BAD: Infrastructure event (not domain)

```kotlin
data class DatabaseRecordInsertedEvent(
    val tableName: String,
    val recordId: Long,
    val timestamp: Instant
)
```

**Why NOT Domain Events**: ❌ This is a technical/infrastructure event, not a domain business occurrence.

---

### Aggregate Consistency

#### ✅ GOOD: Aggregate Root managing child entities

```kotlin
class Order(
    val id: OrderId,
    private val items: MutableList<OrderItem> = mutableListOf(),
    private var status: OrderStatus = OrderStatus.DRAFT
) {
    fun addItem(product: Product, quantity: Int) {
        require(status == OrderStatus.DRAFT) { "Can only add items to draft orders" }
        require(quantity > 0) { "Quantity must be positive" }
        
        // Aggregate consistency: enforce maximum items
        require(items.size < MAX_ITEMS) { "Order cannot exceed $MAX_ITEMS items" }
        
        items.add(OrderItem(product, quantity))
        
        // Aggregate consistency: recalculate total
        recalculateTotal()
    }
    
    fun removeItem(itemId: OrderItemId) {
        require(status == OrderStatus.DRAFT) { "Can only remove items from draft orders" }
        items.removeIf { it.id == itemId }
        recalculateTotal()
    }
    
    private fun recalculateTotal() {
        // Ensures aggregate-wide invariant: total matches items
        total = items.sumOf { it.subtotal() }
    }
    
    fun submit() {
        // Aggregate consistency: validate before submission
        require(items.isNotEmpty()) { "Cannot submit empty order" }
        require(total > BigDecimal.ZERO) { "Order total must be positive" }
        
        status = OrderStatus.SUBMITTED
        DomainEvents.raise(OrderSubmittedEvent(id))
    }
    
    companion object {
        private const val MAX_ITEMS = 100
    }
}
```

**Why Aggregate Consistency**: ✅ Aggregate Root coordinates child entities and maintains consistency across the boundary.

#### ❌ BAD: Simple entity without children

```kotlin
class Customer(
    val id: CustomerId,
    var name: String,
    var email: Email
)
```

**Why NOT Aggregate Consistency**: ❌ Single entity with no child entities to coordinate.

---

### External Dependencies

#### ✅ GOOD: Service with external API dependency

```kotlin
class GeocodeAddressService(
    private val geocodingApi: GeocodingApi  // External dependency
) {
    fun execute(address: Address): Coordinates {
        // External dependency: calls third-party API
        val result = geocodingApi.geocode(
            street = address.street,
            city = address.city,
            country = address.country
        )
        
        return Coordinates(result.latitude, result.longitude)
    }
}
```

**Why External Dependencies**: ✅ Depends on external service (geocoding API) to perform its function.

#### ✅ GOOD: Service with repository dependency

```kotlin
class FindCustomerService(
    private val customerRepository: CustomerRepository  // External dependency
) {
    fun findById(id: CustomerId): Customer {
        return customerRepository.findById(id)
            ?: throw CustomerNotFoundException(id)
    }
}
```

**Why External Dependencies**: ✅ Depends on repository (infrastructure concern) to fetch data.

#### ❌ BAD: Pure domain logic with no dependencies

```kotlin
class OrderPriceCalculator {
    fun calculate(items: List<OrderItem>, discountPercentage: Int): Money {
        val subtotal = items.sumOf { it.price.amount * it.quantity.toBigDecimal() }
        val discount = subtotal * discountPercentage.toBigDecimal() / BigDecimal(100)
        return Money(subtotal - discount, Currency.getInstance("USD"))
    }
}
```

**Why NOT External Dependencies**: ❌ Pure calculation logic with no external service or infrastructure dependencies.

---

### Event Mapping

#### ✅ GOOD: Consumer translating external events

```kotlin
class OrderEventConsumer(
    private val processOrderUseCase: ProcessOrderUseCase
) {
    @KafkaListener(topics = ["external-orders"])
    fun consume(externalEvent: ExternalOrderEvent) {
        // Event Mapping: translate external event to domain
        val domainEvent = mapToDomain(externalEvent)
        processOrderUseCase.execute(domainEvent)
    }
    
    private fun mapToDomain(external: ExternalOrderEvent): OrderPlacedEvent {
        return OrderPlacedEvent(
            orderId = OrderId(external.order_id),  // Different naming convention
            customerId = CustomerId(external.customer_ref),  // Different field name
            totalAmount = Money(
                BigDecimal(external.total_cents) / BigDecimal(100),  // Different unit
                Currency.getInstance(external.currency_code)
            ),
            items = external.line_items.map { mapItem(it) },  // Different structure
            placedAt = Instant.parse(external.created_at)
        )
    }
    
    private fun mapItem(external: ExternalLineItem): OrderItem {
        return OrderItem(
            productId = ProductId(external.sku),
            quantity = external.qty,
            price = Money(BigDecimal(external.unit_price_cents) / BigDecimal(100), Currency.getInstance("USD"))
        )
    }
}
```

**Why Event Mapping**: ✅ Translates between external event schema and internal domain model (anti-corruption layer).

#### ❌ BAD: Processing events without translation

```kotlin
class InternalOrderConsumer(
    private val orderRepository: OrderRepository
) {
    fun consume(event: OrderPlacedEvent) {  // Already in domain format
        val order = orderRepository.findById(event.orderId)
        order?.markAsPlaced()
        orderRepository.save(order)
    }
}
```

**Why NOT Event Mapping**: ❌ Event is already in domain format, no translation needed.

---

### Error Handling

#### ✅ GOOD: Consumer with retry and error recovery

```kotlin
class PaymentEventConsumer(
    private val processPaymentUseCase: ProcessPaymentUseCase,
    private val deadLetterQueue: DeadLetterQueue
) {
    fun consume(event: PaymentEvent) {
        var attempts = 0
        var lastError: Exception? = null
        
        // Error Handling: retry logic
        while (attempts < MAX_RETRIES) {
            try {
                processPaymentUseCase.execute(event.toCommand())
                return  // Success
            } catch (e: TransientException) {
                lastError = e
                attempts++
                logger.warn("Transient error processing payment, attempt $attempts", e)
                Thread.sleep(calculateBackoff(attempts))
            } catch (e: PermanentException) {
                logger.error("Permanent error processing payment", e)
                deadLetterQueue.send(event, e.message)
                return
            }
        }
        
        // Error Handling: send to DLQ after max retries
        logger.error("Max retries exceeded for payment event", lastError)
        deadLetterQueue.send(event, "Max retries exceeded")
    }
    
    private fun calculateBackoff(attempt: Int): Long = (2.0.pow(attempt) * 1000).toLong()
    
    companion object {
        private const val MAX_RETRIES = 3
    }
}
```

**Why Error Handling**: ✅ Explicit retry logic, exponential backoff, and dead letter queue handling.

#### ✅ GOOD: Service with circuit breaker

```kotlin
class ExternalApiClient(
    private val httpClient: HttpClient
) {
    private val circuitBreaker = CircuitBreaker(
        failureThreshold = 5,
        timeout = Duration.ofMinutes(1)
    )
    
    fun call(request: ApiRequest): ApiResponse {
        // Error Handling: circuit breaker pattern
        return circuitBreaker.execute {
            try {
                httpClient.post(request)
            } catch (e: IOException) {
                logger.error("Network error calling external API", e)
                throw CircuitBreakerException("External API unavailable", e)
            } catch (e: TimeoutException) {
                logger.error("Timeout calling external API", e)
                throw CircuitBreakerException("External API timeout", e)
            }
        }
    }
}
```

**Why Error Handling**: ✅ Implements circuit breaker pattern for resilience.

#### ❌ BAD: Simple exception throwing without recovery

```kotlin
class OrderService {
    fun createOrder(command: CreateOrderCommand) {
        if (command.items.isEmpty()) {
            throw InvalidOrderException("Order must have items")
        }
        // ... create order
    }
}
```

**Why NOT Error Handling**: ❌ Just validation that throws exceptions - no error recovery, retry, or resilience patterns.

---

### Idempotency

#### ✅ GOOD: Consumer with idempotency check

```kotlin
class OrderEventConsumer(
    private val processedEventRepository: ProcessedEventRepository,
    private val processOrderUseCase: ProcessOrderUseCase
) {
    @Transactional
    fun consume(event: OrderPlacedEvent) {
        // Idempotency: check if already processed
        if (processedEventRepository.exists(event.eventId)) {
            logger.info("Event ${event.eventId} already processed, skipping")
            return
        }
        
        // Process event
        processOrderUseCase.execute(event)
        
        // Idempotency: mark as processed
        processedEventRepository.save(ProcessedEvent(
            eventId = event.eventId,
            processedAt = Instant.now()
        ))
    }
}
```

**Why Idempotency**: ✅ Checks if event was already processed to prevent duplicate processing.

#### ✅ GOOD: API endpoint with idempotency key

```kotlin
@RestController
class PaymentController(
    private val paymentService: PaymentService,
    private val idempotencyStore: IdempotencyStore
) {
    @PostMapping("/payments")
    fun createPayment(
        @RequestBody request: CreatePaymentRequest,
        @RequestHeader("Idempotency-Key") idempotencyKey: String
    ): ResponseEntity<PaymentResponse> {
        // Idempotency: check if request with this key was already processed
        val existingResponse = idempotencyStore.get(idempotencyKey)
        if (existingResponse != null) {
            return ResponseEntity.ok(existingResponse)
        }
        
        // Process payment
        val payment = paymentService.process(request)
        val response = PaymentResponse.from(payment)
        
        // Idempotency: store response for future duplicate requests
        idempotencyStore.put(idempotencyKey, response, Duration.ofHours(24))
        
        return ResponseEntity.ok(response)
    }
}
```

**Why Idempotency**: ✅ Uses idempotency key to ensure same request can be safely retried.

#### ❌ BAD: No idempotency protection

```kotlin
class NotificationConsumer(
    private val emailService: EmailService
) {
    fun consume(event: NotificationEvent) {
        // No idempotency check - will send duplicate emails if event is reprocessed
        emailService.sendEmail(
            to = event.recipientEmail,
            subject = event.subject,
            body = event.body
        )
    }
}
```

**Why NOT Idempotency**: ❌ No protection against duplicate processing - same event processed twice will send duplicate emails.

---

### Side Effects

#### ✅ GOOD: Service with database write side effect

```kotlin
class CreateUserService(
    private val userRepository: UserRepository,
    private val eventPublisher: EventPublisher
) {
    fun execute(command: CreateUserCommand): User {
        val user = User(
            id = UserId.generate(),
            email = Email(command.email),
            name = command.name
        )
        
        // Side Effect: database write
        userRepository.save(user)
        
        // Side Effect: publish event
        eventPublisher.publish(UserCreatedEvent(user.id))
        
        return user
    }
}
```

**Why Side Effects**: ✅ Saves to database and publishes events - changes state outside the function scope.

#### ✅ GOOD: Service calling external API

```kotlin
class SendNotificationService(
    private val smsClient: SmsClient,
    private val auditLogger: AuditLogger
) {
    fun execute(notification: Notification) {
        // Side Effect: send SMS
        smsClient.send(
            phoneNumber = notification.recipient,
            message = notification.message
        )
        
        // Side Effect: write audit log
        auditLogger.log(
            action = "NOTIFICATION_SENT",
            details = "SMS sent to ${notification.recipient}"
        )
    }
}
```

**Why Side Effects**: ✅ Sends SMS (I/O) and writes logs (I/O).

#### ❌ BAD: Pure function with no side effects

```kotlin
class PriceCalculator {
    fun calculateWithTax(price: BigDecimal, taxRate: BigDecimal): BigDecimal {
        return price + (price * taxRate)
    }
}
```

**Why NOT Side Effects**: ❌ Pure calculation that only computes and returns a value without any I/O or state changes.

---

### Transaction Management

#### ✅ GOOD: Application service with transaction

```kotlin
class TransferMoneyService(
    private val accountRepository: AccountRepository,
    private val eventPublisher: EventPublisher
) {
    @Transactional  // Transaction Management
    fun execute(command: TransferMoneyCommand) {
        val fromAccount = accountRepository.findById(command.fromAccountId)
            ?: throw AccountNotFoundException()
        val toAccount = accountRepository.findById(command.toAccountId)
            ?: throw AccountNotFoundException()
        
        fromAccount.withdraw(command.amount)
        toAccount.deposit(command.amount)
        
        // Both saves happen in same transaction
        accountRepository.save(fromAccount)
        accountRepository.save(toAccount)
        
        eventPublisher.publish(MoneyTransferredEvent(
            fromAccountId = command.fromAccountId,
            toAccountId = command.toAccountId,
            amount = command.amount
        ))
    }
}
```

**Why Transaction Management**: ✅ Uses @Transactional to ensure all operations succeed or fail together.

#### ✅ GOOD: Saga pattern for distributed transaction

```kotlin
class OrderSaga(
    private val orderService: OrderService,
    private val paymentService: PaymentService,
    private val inventoryService: InventoryService,
    private val sagaRepository: SagaRepository
) {
    fun execute(command: CreateOrderCommand): SagaResult {
        val sagaId = SagaId.generate()
        val saga = Saga(sagaId, SagaStatus.STARTED)
        
        try {
            // Step 1: Create order
            saga.addStep("CREATE_ORDER")
            val order = orderService.createOrder(command)
            sagaRepository.save(saga)
            
            // Step 2: Reserve inventory
            saga.addStep("RESERVE_INVENTORY")
            inventoryService.reserve(order.items)
            sagaRepository.save(saga)
            
            // Step 3: Process payment
            saga.addStep("PROCESS_PAYMENT")
            paymentService.processPayment(order.totalAmount, command.paymentDetails)
            sagaRepository.save(saga)
            
            saga.complete()
            sagaRepository.save(saga)
            
            return SagaResult.success(order)
            
        } catch (e: Exception) {
            // Transaction Management: compensating transactions
            saga.fail(e.message)
            compensate(saga)
            sagaRepository.save(saga)
            
            return SagaResult.failure(e.message)
        }
    }
    
    private fun compensate(saga: Saga) {
        saga.completedSteps.reversed().forEach { step ->
            when (step) {
                "PROCESS_PAYMENT" -> paymentService.refund(saga.orderId)
                "RESERVE_INVENTORY" -> inventoryService.release(saga.orderId)
                "CREATE_ORDER" -> orderService.cancelOrder(saga.orderId)
            }
        }
    }
}
```

**Why Transaction Management**: ✅ Implements saga pattern to coordinate distributed transactions with compensating actions.

#### ❌ BAD: Simple query with no transaction coordination

```kotlin
class GetUserService(
    private val userRepository: UserRepository
) {
    fun execute(userId: UserId): User {
        return userRepository.findById(userId)
            ?: throw UserNotFoundException()
    }
}
```

**Why NOT Transaction Management**: ❌ Simple read operation with no transaction coordination needed.

---

## Common Classification Patterns by DDD Category

### Value Objects
- ✅ Invariants, Transformations, Factory/Creation
- ❌ Identity Management (use structural equality), Side Effects

### Entities
- ✅ Invariants, Business Rules, Identity Management
- Often: Lifecycle Management, Domain Events

### Aggregates
- ✅ All of Entity + Aggregate Consistency
- Often: Domain Events, Lifecycle Management

### Domain Services
- ✅ Business Rules, External Dependencies
- Sometimes: Side Effects, Transaction Management

### Application Services / Use Cases
- ✅ Business Rules, External Dependencies, Side Effects, Transaction Management
- Sometimes: Error Handling

### Event Handlers (Application)
- ✅ Inbound communication, External Dependencies, Side Effects
- Often: Event Mapping, Error Handling, Idempotency
- ❌ Business Rules (delegate to use cases), Invariants

### Event Consumers (Infrastructure / UI Layer)
- ✅ Integration Rules, Event Mapping, External Dependencies, Inbound communication
- Often: Error Handling, Idempotency, Side Effects, Outbound communication

### Integration Events
- ✅ Integration event
- Sometimes: Transformations
- ❌ Business Rules, Domain Events, Side Effects

### Controllers
- ✅ Inbound communication, Validation Rules
- Sometimes: Business Rules, External Dependencies

### Factories (Domain)
- ✅ Factory/Creation, Business Rules
- Sometimes: Invariants
- ❌ Side Effects, External Dependencies, Inbound/Outbound communications

### Specifications (Domain)
- ✅ Business Rules
- Sometimes: Transformations
- ❌ Side Effects, External Dependencies, Lifecycle Management

### Policies (Domain)
- ✅ Business Rules
- Sometimes: External Dependencies
- ❌ Side Effects, Lifecycle Management, Inbound/Outbound communications

### Sagas (Domain/Application)
- ✅ External Dependencies, Transaction Management, Error Handling
- Often: Side Effects, Business Rules
- Sometimes: Outbound communication

### Responses (UI or Application)
- ✅ Transformations
- Sometimes: Validation Rules
- ❌ Business Rules, Domain Events, Side Effects

### API Clients / Event Publishers
- ✅ Outbound communication, External Dependencies, Side Effects
- Sometimes: Transformations, Error Handling

### Mappers (Infrastructure)
- ✅ Validation Rules, Transformations
- ❌ Business Rules, Domain Events, Inbound/Outbound communications

### Adapters (Infrastructure)
- ✅ Outbound communication, External Dependencies, Transformations, Error Handling
- Often: Side Effects
- ❌ Business Rules, Domain Events, Invariants

### Projections (Infrastructure)
- ✅ Event Mapping, Side Effects, External Dependencies
- Often: Idempotency, Inbound communication, Transformations
- ❌ Business Rules, Invariants

### Read Models (Infrastructure)
- ✅ Transformations
- Sometimes: External Dependencies
- ❌ Business Rules, Domain Events, Side Effects, Inbound communication

