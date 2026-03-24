# DDD Classification Guide for code_manifest.md (Simplified for LLMs)

## Purpose
Help AI agents correctly classify classes across 20 DDD aspects when cataloging in `code_manifest.md`.

**Classification Columns:**
Inbound communication | Outbound communication | Integration Rules | Validation Rules | Invariants | Business Rules | Factory/Creation | Transformations | Identity Management | Lifecycle Management | Domain Events | Integration event | Aggregate Consistency | External Dependencies | Event Mapping | Error Handling | Idempotency | Side Effects | Transaction Management | Possible outsider

**IMPORTANT**: Only mark columns with ✓ - never add text descriptions.

---

## Quick Reference Definitions


### Inbound communication
**What**: Entry points that receive requests from external sources  
**Where**: Controllers, REST endpoints, message consumers, event listeners, CLI handlers  
**Mark ✓ if**: Receives HTTP requests, consumes messages/events, or handles external commands

### Outbound communication
**What**: Exit points that communicate with external systems  
**Where**: API clients, gateways, event publishers, message producers, external service adapters  
**Mark ✓ if**: Makes HTTP/API calls, publishes events/messages, or calls external services

> **API client**: Infrastructure adapter implementing an application-layer outbound port to call an external REST/HTTP API. Translates domain calls into HTTP requests, handles retries/timeouts, and maps HTTP responses to domain objects. Always mark: Outbound communication ✓, External Dependencies ✓, Side Effects ✓. Often also: Error Handling ✓, Transformations ✓.

> **Gateway**: Infrastructure facade that aggregates calls to multiple external APIs or provides anti-corruption layer translation. Broader than a single API client. Always mark: Outbound communication ✓, External Dependencies ✓, Side Effects ✓, Transformations ✓.

### Integration Rules
**What**: Boundary protection from external systems  
**Where**: Event consumers, adapters, anti-corruption layers  
**Mark ✓ if**: Filters/rejects external data based on source, version, or schema compatibility

### Validation Rules  
**What**: Technical format validation at system boundaries  
**Where**: Mappers, controllers, DTOs  
**Mark ✓ if**: Validates data types, formats, or syntax before domain processing

### Invariants
**What**: Structural integrity constraints that must always be true  
**Where**: Value Objects, Entities, Aggregates (constructors, init blocks)  
**Mark ✓ if**: Violation makes the object fundamentally invalid

### Business Rules
**What**: Business policies and workflows that can change  
**Where**: Domain Services, Application Services, Use Cases  
**Mark ✓ if**: Logic reflects changeable business policies or workflows

### Factory/Creation Logic
**What**: Object instantiation with defaults or strategies  
**Where**: Companion objects, factory methods, builders  
**Mark ✓ if**: Has factory methods or builder patterns for object creation

### Transformations
**What**: Convert, calculate, or derive data  
**Where**: Value Objects, mappers, calculators  
**Mark ✓ if**: Converts between formats, units, or calculates derived values

### Identity Management
**What**: How objects establish unique identity  
**Where**: Entities, Aggregates (never Value Objects)  
**Mark ✓ if**: Has ID property with equals()/hashCode() based on ID

### Lifecycle Management
**What**: State transitions and lifecycle control  
**Where**: Entities, Aggregates  
**Mark ✓ if**: Manages state transitions with validation rules

### Domain Events
**What**: Notifications of significant domain occurrences
**Where**: Aggregates (emitters), Event classes
**Mark ✓ if**: Emits domain events OR is itself a domain event class

### Integration event
**What**: Events representing significant system changes for external systems or other bounded contexts
**Where**: Infrastructure layer event classes (often in `.infrastructure.events` or `.infrastructure.messaging` packages)
**Mark ✓ if**: IS an event class with these characteristics:
- Located in infrastructure layer (not domain layer)
- Uses primitive types (String, Int, Long, BigDecimal) instead of domain types (OrderId, CustomerId)
- Includes event metadata (eventId, eventVersion, correlationId, timestamp)
- Designed for serialization to external systems (JSON, Avro, Protobuf)
- Crosses bounded context or system boundaries

### Aggregate Consistency
**What**: Maintains consistency across aggregate boundaries  
**Where**: Aggregate Roots only  
**Mark ✓ if**: Coordinates child entities and enforces aggregate-wide invariants

### External Dependencies
**What**: Dependencies on external services/systems  
**Where**: Domain Services, Application Services  
**Mark ✓ if**: Uses repositories, APIs, message brokers, or external services

### Event Mapping
**What**: Translates external events to domain models  
**Where**: Event consumers, anti-corruption layers  
**Mark ✓ if**: Converts between external event schemas and domain objects

### Error Handling
**What**: Manages failures with retry/recovery patterns  
**Where**: Event consumers, adapters, infrastructure services  
**Mark ✓ if**: Has explicit error recovery (retry, circuit breaker, fallback, DLQ)

### Idempotency
**What**: Safe to process same input multiple times  
**Where**: Event consumers, API handlers  
**Mark ✓ if**: Implements idempotency checks or deduplication logic

### Side Effects
**What**: Changes state outside function scope  
**Where**: Services, repositories, event consumers  
**Mark ✓ if**: Performs I/O (database, network, files) or publishes events

### Transaction Management
**What**: Coordinates atomic operations  
**Where**: Application Services, repositories  
**Mark ✓ if**: Uses @Transactional, explicit transactions, or saga patterns

### Possible outsider
**What**: Flags classes that potentially violate DDD principles or architectural patterns  
**Where**: Any layer where architectural violations might occur  
**Mark ✓ if**: Class shows signs of:
- Layer violations (domain depending on infrastructure, UI logic in domain)
- Mixed responsibilities (e.g., entity doing I/O, value object with identity)
- Anti-patterns (anemic domain models, god objects, circular dependencies)
- Unclear layer assignment (could belong to multiple layers)
- Business logic in wrong layer (business rules in controllers/mappers)
- Infrastructure concerns leaking into domain (database annotations in entities)
- Missing expected patterns (aggregate without consistency enforcement, consumer without idempotency)

---

## Decision Framework

| If the class... | Then mark... |
|----------------|--------------|
| Validates object structural integrity in constructor/init | **Invariants** ✓ |
| Enforces changeable business policies at service level | **Business Rules** ✓ |
| Validates technical formats at boundaries (mapper/controller) | **Validation Rules** ✓ |
| Filters external system data at integration points | **Integration Rules** ✓ |
| Has factory methods or builder patterns | **Factory/Creation** ✓ |
| Converts between formats or calculates derived values | **Transformations** ✓ |
| Is an Entity/Aggregate with ID-based equality | **Identity Management** ✓ |
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

## Examples by Classification

### Integration Rules

✅ **GOOD**: Consumer filtering external data
```kotlin
class PaymentEventConsumer {
    fun consume(event: PaymentEvent) {
        if (event.source != "payment-gateway") return  // Integration Rule
        if (event.paymentType !in SUPPORTED_TYPES) return  // Integration Rule
        processPayment(event)
    }
}
```
**Classification**: Integration Rules ✓ (all others ❌)

❌ **BAD**: Domain validation (not integration rule)
```kotlin
class OrderService {
    fun createOrder(command: CreateOrderCommand) {
        require(command.items.isNotEmpty()) // Domain validation, NOT integration rule
    }
}
```

---

### Validation Rules

✅ **GOOD**: Technical format validation in mapper
```kotlin
class ProductMapper {
    fun toCommand(request: CreateProductRequest): CreateProductCommand {
        val price = request.price?.toBigDecimalOrNull()
            ?: throw ValidationException("price must be valid decimal")
        val date = LocalDate.parse(request.date)  // Format validation
        return CreateProductCommand(price, date)
    }
}
```
**Classification**: Validation Rules ✓ (all others ❌)

❌ **BAD**: Domain invariant (not validation rule)
```kotlin
data class Email(val value: String) {
    init { require(value.matches(EMAIL_REGEX)) } // This is INVARIANT
}
```

---

### Invariants

✅ **GOOD**: Structural integrity in Value Object
```kotlin
data class Quantity(val value: Int) {
    init {
        require(value > 0) { "Quantity must be positive" }
        require(value <= 999999) { "Quantity exceeds maximum" }
    }
}
```
**Classification**: Invariants ✓ (all others ❌)

❌ **BAD**: Business policy mixed with invariant
```kotlin
class Order(val total: BigDecimal) {
    init {
        require(total >= BigDecimal.ZERO) // ✓ Invariant
        require(total >= MIN_ORDER) // ✓ Business Rule (both should be marked!)
    }
}
```

---

### Business Rules

✅ **GOOD**: Business policy in service
```kotlin
class ApplyDiscountService {
    fun execute(order: Order, coupon: Coupon) {
        require(order.status == ACTIVE) { "Only active orders" } // Business Rule
        require(coupon.isExpired().not()) { "Coupon expired" } // Business Rule
        require(order.total >= coupon.minimumPurchase) // Business Rule
        
        val discount = min(calculateDiscount(order, coupon), coupon.maxDiscount)
        order.applyDiscount(discount)
    }
}
```
**Classification**: Business Rules ✓ (all others ❌)

---

### Factory/Creation Logic

✅ **GOOD**: Factory methods with defaults
```kotlin
data class UserProfile(
    val userId: UserId,
    val displayName: String,
    val avatar: String?
) {
    companion object {
        fun createDefault(userId: UserId) = UserProfile(
            userId = userId,
            displayName = "User ${userId.value}",
            avatar = null
        )
    }
}
```
**Classification**: Factory/Creation ✓ (all others ❌)

❌ **BAD**: Simple data class (no factory logic)
```kotlin
data class Point(val x: Double, val y: Double) // No factory methods
```

---

### Transformations

✅ **GOOD**: Unit conversions
```kotlin
data class Weight(val grams: Double) {
    fun toKilograms() = grams / 1000.0
    fun toPounds() = grams / 453.592
    
    companion object {
        fun fromKilograms(kg: Double) = Weight(kg * 1000.0)
    }
}
```
**Classification**: Transformations ✓, Factory/Creation ✓ (others ❌)

❌ **BAD**: Simple getter (not transformation)
```kotlin
class Product(val price: BigDecimal) {
    fun getPrice() = price // Just returns value, no transformation
}
```

---

### Identity Management

✅ **GOOD**: Entity with ID-based equality
```kotlin
class Product(
    val id: ProductId,
    var name: String,
    var price: Money
) {
    override fun equals(other: Any?) = 
        other is Product && id == other.id
    override fun hashCode() = id.hashCode()
}
```
**Classification**: Identity Management ✓ (all others ❌)

❌ **BAD**: Value Object (uses structural equality)
```kotlin
data class Address(val street: String, val city: String) 
// Value Object - structural equality, NOT identity management
```

---

### Lifecycle Management

✅ **GOOD**: State transitions with validation
```kotlin
class Loan(
    val id: LoanId,
    private var status: LoanStatus
) {
    fun approve() {
        require(status == PENDING) { "Can only approve pending loans" }
        status = APPROVED
        DomainEvents.raise(LoanApprovedEvent(id))
    }
    
    fun disburse() {
        require(status == APPROVED) { "Can only disburse approved loans" }
        status = DISBURSED
    }
}
```
**Classification**: Lifecycle Management ✓, Domain Events ✓, Identity Management ✓ (others ❌)

❌ **BAD**: Immutable Value Object
```kotlin
data class Money(val amount: BigDecimal, val currency: Currency) 
// Immutable - no lifecycle
```

---

### Domain Events

✅ **GOOD**: Aggregate emitting events
```kotlin
class Subscription(val id: SubscriptionId, private var status: Status) {
    fun activate() {
        status = ACTIVE
        DomainEvents.raise(SubscriptionActivatedEvent(id))
    }
    
    fun cancel(reason: CancellationReason) {
        status = CANCELLED
        DomainEvents.raise(SubscriptionCancelledEvent(id, reason))
    }
}
```
**Classification**: Domain Events ✓, Lifecycle Management ✓, Identity Management ✓ (others ❌)

✅ **GOOD**: Domain event class itself
```kotlin
data class OrderPlacedEvent(
    val orderId: OrderId,
    val customerId: CustomerId,
    val placedAt: Instant
) : DomainEvent
```
**Classification**: Domain Events ✓ (all others ❌)

❌ **BAD**: Technical event (not domain)
```kotlin
data class DatabaseInsertedEvent(val tableName: String, val id: Long)
// Infrastructure event, not domain event
```

---

### Integration event

✅ **GOOD**: Integration event crossing bounded contexts (identified by primitive types and infrastructure layer location)
```kotlin
// Located in: com.company.orders.infrastructure.events
data class OrderCompletedEvent(
    val orderId: String,              // Primitive String, not domain OrderId
    val customerId: String,           // Primitive String, not domain CustomerId
    val totalAmount: BigDecimal,
    val currency: String,
    val completedAt: String,          // ISO-8601 string, not domain Instant
    val eventId: String,
    val eventVersion: Int
)
```
**Classification**: Integration event ✓, Transformations ✓ (others ❌)
**Why**: Uses primitive types (String, BigDecimal) instead of domain types, includes event metadata (eventId, eventVersion), located in infrastructure layer

✅ **GOOD**: Integration event published to external systems (identified by serialization and boundary crossing)
```kotlin
// Located in: com.company.payments.infrastructure.messaging
data class PaymentProcessedEvent(
    val paymentId: String,
    val orderReference: String,
    val amount: BigDecimal,
    val currency: String,
    val timestamp: Long,              // Unix timestamp for external systems
    val correlationId: String
)
```
**Classification**: Integration event ✓ (all others ❌)
**Why**: Designed for external consumption, uses serializable primitives, includes correlation/tracing metadata

❌ **BAD**: Domain event (internal to bounded context)
```kotlin
// Located in: com.company.orders.domain.events
data class OrderPlacedEvent(
    val orderId: OrderId,             // Domain type, not primitive
    val customerId: CustomerId,       // Domain type, not primitive
    val items: List<OrderItem>,       // Domain aggregate children
    val placedAt: Instant             // Domain type
)
```
**Why NOT integration event**: Uses domain types (OrderId, CustomerId), includes domain entities (OrderItem), no serialization concerns, stays within bounded context

❌ **BAD**: Domain event published internally
```kotlin
// Located in: com.company.catalog.domain.events
data class ProductStockUpdated(
    val productId: ProductId,
    val newStock: Quantity,
    val warehouse: WarehouseId
)
```
**Why NOT integration event**: Uses value objects (ProductId, Quantity, WarehouseId), stays within domain layer, no cross-context concerns

---

### Aggregate Consistency

✅ **GOOD**: Aggregate Root managing children
```kotlin
class Order(
    val id: OrderId,
    private val items: MutableList<OrderItem> = mutableListOf(),
    private var status: OrderStatus = DRAFT
) {
    fun addItem(product: Product, quantity: Int) {
        require(status == DRAFT) { "Can only add items to draft orders" }
        require(items.size < MAX_ITEMS) { "Maximum items exceeded" }
        items.add(OrderItem(product, quantity))
        recalculateTotal() // Maintains aggregate consistency
    }
    
    private fun recalculateTotal() {
        total = items.sumOf { it.subtotal() }
    }
}
```
**Classification**: Aggregate Consistency ✓, Business Rules ✓, Transformations ✓, Identity Management ✓ (others ❌)

❌ **BAD**: Single entity (no children to coordinate)
```kotlin
class Customer(val id: CustomerId, var name: String) 
// Single entity, not managing children
```

---

### External Dependencies

✅ **GOOD**: Service with external API
```kotlin
class GeocodeService(
    private val geocodingApi: GeocodingApi  // External dependency
) {
    fun execute(address: Address): Coordinates {
        val result = geocodingApi.geocode(address) // External call
        return Coordinates(result.lat, result.lng)
    }
}
```
**Classification**: External Dependencies ✓, Side Effects ✓, Outbound communication ✓ (others ❌)

❌ **BAD**: Pure domain logic
```kotlin
class PriceCalculator {
    fun calculate(items: List<Item>, discount: Int): Money {
        return items.sumOf { it.price } * (1 - discount / 100.0)
    }
}
// No external dependencies
```

---

### Event Mapping

✅ **GOOD**: Translating external events
```kotlin
class OrderEventConsumer(
    private val processOrder: ProcessOrderUseCase
) {
    fun consume(external: ExternalOrderEvent) {
        val domain = OrderPlacedEvent(
            orderId = OrderId(external.order_id),  // Different naming
            customerId = CustomerId(external.customer_ref),  // Different field
            total = Money(external.total_cents / 100)  // Different unit
        )
        processOrder.execute(domain)
    }
}
```
**Classification**: Event Mapping ✓, Inbound communication ✓ (all others ❌)

❌ **BAD**: Already domain format
```kotlin
class InternalConsumer {
    fun consume(event: OrderPlacedEvent) { // Already domain format
        // No translation needed
    }
}
```

---

### Error Handling

✅ **GOOD**: Retry with exponential backoff
```kotlin
class PaymentConsumer(
    private val processPayment: ProcessPaymentUseCase,
    private val deadLetterQueue: DeadLetterQueue
) {
    fun consume(event: PaymentEvent) {
        repeat(MAX_RETRIES) { attempt ->
            try {
                processPayment.execute(event)
                return
            } catch (e: TransientException) {
                Thread.sleep(calculateBackoff(attempt))
            } catch (e: PermanentException) {
                deadLetterQueue.send(event)
                return
            }
        }
        deadLetterQueue.send(event)
    }
}
```
**Classification**: Error Handling ✓, Idempotency ✓, Inbound communication ✓, Outbound communication ✓ (others ❌)

❌ **BAD**: Simple exception throwing
```kotlin
class OrderService {
    fun create(cmd: CreateOrderCommand) {
        if (cmd.items.isEmpty()) throw InvalidOrderException()
        // No error recovery patterns
    }
}
```

---

### Idempotency

✅ **GOOD**: Idempotency check with deduplication
```kotlin
class OrderConsumer(
    private val processedEvents: ProcessedEventRepository,
    private val processOrder: ProcessOrderUseCase
) {
    @Transactional
    fun consume(event: OrderPlacedEvent) {
        if (processedEvents.exists(event.eventId)) {
            return // Already processed
        }
        processOrder.execute(event)
        processedEvents.save(event.eventId)
    }
}
```
**Classification**: Idempotency ✓, Transaction Management ✓, Side Effects ✓, Inbound communication ✓ (others ❌)

❌ **BAD**: No duplicate protection
```kotlin
class NotificationConsumer(private val emailService: EmailService) {
    fun consume(event: NotificationEvent) {
        emailService.send(event.email) // Will send duplicates if reprocessed
    }
}
```

---

### Side Effects

✅ **GOOD**: Database writes and event publishing
```kotlin
class CreateUserService(
    private val userRepo: UserRepository,
    private val eventPublisher: EventPublisher
) {
    fun execute(cmd: CreateUserCommand): User {
        val user = User(UserId.generate(), cmd.email, cmd.name)
        userRepo.save(user) // Side Effect: database write
        eventPublisher.publish(UserCreatedEvent(user.id)) // Side Effect: publish
        return user
    }
}
```
**Classification**: Side Effects ✓, External Dependencies ✓, Outbound communication ✓ (others ❌)

❌ **BAD**: Pure calculation
```kotlin
class TaxCalculator {
    fun calculate(price: BigDecimal, rate: BigDecimal) = price * rate
    // Pure function, no side effects
}
```

---

### Transaction Management

✅ **GOOD**: Service with @Transactional
```kotlin
class TransferMoneyService(
    private val accountRepo: AccountRepository
) {
    @Transactional
    fun execute(cmd: TransferMoneyCommand) {
        val from = accountRepo.findById(cmd.fromId)!!
        val to = accountRepo.findById(cmd.toId)!!
        
        from.withdraw(cmd.amount)
        to.deposit(cmd.amount)
        
        accountRepo.save(from)
        accountRepo.save(to)
    }
}
```
**Classification**: Transaction Management ✓, External Dependencies ✓, Side Effects ✓, Business Rules ✓ (others ❌)

✅ **GOOD**: Saga pattern for distributed transactions
```kotlin
class OrderSaga(
    private val orderService: OrderService,
    private val paymentService: PaymentService,
    private val inventoryService: InventoryService
) {
    fun execute(cmd: CreateOrderCommand): SagaResult {
        try {
            val order = orderService.create(cmd)
            inventoryService.reserve(order.items)
            paymentService.process(order.total)
            return SagaResult.success(order)
        } catch (e: Exception) {
            compensate() // Rollback distributed operations
            return SagaResult.failure(e)
        }
    }
}
```
**Classification**: Transaction Management ✓, Error Handling ✓, External Dependencies ✓ (others ❌)

❌ **BAD**: Simple read operation
```kotlin
class GetUserService(private val userRepo: UserRepository) {
    fun execute(id: UserId) = userRepo.findById(id)
    // No transaction coordination needed
}
```

---

### Inbound communication

✅ **GOOD**: REST controller receiving requests
```kotlin
@RestController
@RequestMapping("/api/orders")
class OrderController(
    private val createOrder: CreateOrderUseCase
) {
    @PostMapping
    fun create(@RequestBody request: CreateOrderRequest): OrderResponse {
        val command = CreateOrderCommand(
            customerId = request.customerId,
            items = request.items
        )
        val order = createOrder.execute(command)
        return OrderResponse.from(order)
    }
}
```
**Classification**: Inbound communication ✓, Validation Rules ✓ (others ❌)

✅ **GOOD**: Message consumer
```kotlin
@Component
class OrderEventConsumer(
    private val processOrder: ProcessOrderUseCase
) {
    @RabbitListener(queues = ["orders"])
    fun consume(message: OrderMessage) {
        val event = OrderPlacedEvent(
            orderId = OrderId(message.orderId),
            customerId = CustomerId(message.customerId)
        )
        processOrder.execute(event)
    }
}
```
**Classification**: Inbound communication ✓, Event Mapping ✓ (others ❌)

❌ **BAD**: Internal service (not an entry point)
```kotlin
class CalculatePriceService {
    fun execute(items: List<Item>): Money {
        return items.sumOf { it.price }
    }
}
// Internal service, not receiving external requests
```

---

### Outbound communication

✅ **GOOD**: API client calling external service
```kotlin
class PaymentGatewayClient(
    private val httpClient: HttpClient
) {
    fun processPayment(payment: Payment): PaymentResult {
        val response = httpClient.post("https://payment-gateway/api/process") {
            body = payment.toJson()
        }
        return PaymentResult.from(response)
    }
}
```
**Classification**: Outbound communication ✓, External Dependencies ✓, Side Effects ✓ (others ❌)

✅ **GOOD**: Event publisher
```kotlin
class OrderEventPublisher(
    private val eventBus: EventBus
) {
    fun publish(event: OrderPlacedEvent) {
        val message = OrderEventMessage(
            orderId = event.orderId.value,
            customerId = event.customerId.value,
            timestamp = event.timestamp
        )
        eventBus.publish("orders.placed", message)
    }
}
```
**Classification**: Outbound communication ✓, External Dependencies ✓, Side Effects ✓ (others ❌)

❌ **BAD**: Internal repository (not external communication)
```kotlin
interface OrderRepository {
    fun save(order: Order)
    fun findById(id: OrderId): Order?
}
// Repository interface - not an Outbound communication
```

---

## Complex Multi-Aspect Examples

### Example 1: Aggregate Root with Multiple Aspects

```kotlin
class ShoppingCart(
    val id: CartId,
    private val items: MutableList<CartItem> = mutableListOf(),
    private var status: CartStatus = ACTIVE
) {
    init {
        require(id.value.isNotBlank()) // Invariant
    }
    
    fun addItem(item: CartItem) {
        require(status == ACTIVE) // Business Rule
        require(items.size < MAX_ITEMS) // Business Rule
        items.add(item)
    }
    
    fun checkout() {
        require(status == ACTIVE) // Business Rule
        require(items.isNotEmpty()) // Business Rule
        status = CHECKED_OUT // Lifecycle transition
        DomainEvents.raise(CartCheckedOutEvent(id, total()))
    }
    
    fun total() = items.sumOf { it.price * it.quantity } // Transformation
    
    override fun equals(other: Any?) = other is ShoppingCart && id == other.id
    override fun hashCode() = id.hashCode()
}
```

**Classification:**
- Invariants ✓ (ID validation)
- Business Rules ✓ (status checks, max items)
- Identity Management ✓ (ID-based equality)
- Lifecycle Management ✓ (status transitions)
- Domain Events ✓ (emits CartCheckedOutEvent)
- Aggregate Consistency ✓ (manages child items)
- Transformations ✓ (total calculation)
- All others ❌

---

### Example 2: Service with Infrastructure Concerns

```kotlin
class ProcessPaymentService(
    private val accountRepo: AccountRepository,
    private val userRepo: UserRepository,
    private val fraudDetector: FraudDetector
) {
    @Transactional
    fun execute(cmd: ProcessPaymentCommand) {
        val user = userRepo.findById(cmd.userId) ?: throw UserNotFoundException()
        
        if (!user.isVerified()) throw UnverifiedUserException() // Business Rule
        if (user.hasOverduePayments()) throw OverduePaymentsException() // Business Rule
        
        val account = accountRepo.findById(cmd.accountId) ?: throw AccountNotFoundException()
        
        if (!fraudDetector.isLegitimate(cmd)) throw FraudDetectedException() // Business Rule
        
        account.processPayment(cmd.amount)
        accountRepo.save(account)
    }
}
```

**Classification:**
- Business Rules ✓ (verification, overdue checks, fraud detection)
- External Dependencies ✓ (repositories, fraud detector)
- Side Effects ✓ (database save)
- Transaction Management ✓ (@Transactional)
- All others ❌

---

### Example 3: Consumer with Full Integration Pattern

```kotlin
class OrderEventConsumer(
    private val processedEvents: ProcessedEventRepository,
    private val processOrder: ProcessOrderUseCase,
    private val deadLetterQueue: DeadLetterQueue
) {
    @KafkaListener(topics = ["external-orders"])
    fun consume(external: ExternalOrderEvent) {
        // Integration Rule: filter by source
        if (external.source != "order-api") return
        
        // Idempotency check
        if (processedEvents.exists(external.eventId)) return
        
        try {
            // Event Mapping: translate to domain
            val domain = OrderPlacedEvent(
                orderId = OrderId(external.order_id),
                customerId = CustomerId(external.customer_ref),
                total = Money(external.total_cents / 100)
            )
            
            processOrder.execute(domain)
            processedEvents.save(external.eventId)
        } catch (e: Exception) {
            // Error Handling: send to DLQ
            deadLetterQueue.send(external, e.message)
        }
    }
}
```

**Classification:**
- Integration Rules ✓ (source filtering)
- Event Mapping ✓ (external to domain translation)
- Idempotency ✓ (duplicate check)
- Error Handling ✓ (DLQ on failure)
- External Dependencies ✓ (repositories, use case)
- Side Effects ✓ (database writes, DLQ)
- Inbound communication ✓ (Kafka consumer)
- Outbound communication ✓ (DLQ producer)
- All others ❌

---

## Common Classification Patterns

### Value Objects
Typical: Invariants ✓, Transformations ✓, Factory/Creation ✓  
Never: Identity Management, Lifecycle Management, Side Effects

### Entities
Typical: Invariants ✓, Business Rules ✓, Identity Management ✓  
Sometimes: Lifecycle Management, Domain Events

### Aggregates
Typical: All of Entity + Aggregate Consistency ✓  
Often: Domain Events ✓, Lifecycle Management ✓

### Domain Services
Typical: Business Rules ✓, External Dependencies ✓  
Sometimes: Side Effects, Transaction Management

### Application Services
Typical: Business Rules ✓, External Dependencies ✓, Side Effects ✓, Transaction Management ✓  
Sometimes: Error Handling

### Event Consumers
Typical: Integration Rules ✓, Event Mapping ✓, External Dependencies ✓, Inbound communication ✓
Often: Error Handling ✓, Idempotency ✓, Side Effects ✓, Outbound communication ✓

### Integration Events
Typical: Integration event ✓
Sometimes: Transformations ✓
Never: Business Rules, Domain Events, Side Effects

### Controllers
Typical: Inbound communication ✓, Validation Rules ✓
Sometimes: Business Rules ✓, External Dependencies ✓

### Responses
Typical: Transformations ✓  
Sometimes: Validation Rules ✓  
Never: Business Rules, Domain Events, Side Effects

### API Clients / Event Publishers
Typical: Outbound communication ✓, External Dependencies ✓, Side Effects ✓  
Sometimes: Transformations ✓, Error Handling ✓

### Mappers
Typical: Validation Rules ✓, Transformations ✓  
Never: Business Rules, Domain Events, Inbound/Outbound communications

### User Interface Responses
Typical: Transformations ✓  
Sometimes: Validation Rules ✓  
Never: Business Rules, Domain Events, Side Effects, Inbound/Outbound communications

### Application Responses
Typical: Transformations ✓  
Sometimes: Validation Rules ✓  
Never: Business Rules, Domain Events, Side Effects, Inbound/Outbound communications

---

## Response Definitions by Layer

### User Interface Response
**What**: Data structures returned to external clients (HTTP responses, API responses)  
**Where**: REST controllers, GraphQL resolvers, gRPC services  
**Purpose**: External contract for API consumers

**Characteristics**:
- Serializable to JSON/XML/Protobuf
- Primitive types (String, Int, Boolean) or simple collections
- No domain logic or behavior
- API versioning concerns
- Stable external contract

**Generic Structure**:
```
Response Object:
  - id: primitive identifier
  - simple properties: strings, numbers, booleans
  - nested responses: lists or objects of other responses
  - no methods except serialization helpers
```

**Classification Pattern**:
- Transformations ✓ (converts domain to API format)
- Sometimes: Validation Rules ✓ (output format validation)
- Never: Business Rules, Domain Events, Side Effects, Identity Management

**Example Pattern**: `OrderResponse`, `CustomerResponse`, `ProductListResponse`

---

### Application Response
**What**: Data structures returned from application services to UI layer (internal)  
**Where**: Use cases, application services  
**Purpose**: Internal contract between application and UI layers

**Characteristics**:
- May contain domain objects directly
- Richer types (domain Value Objects, Entities)
- Aggregates results from multiple operations
- No serialization concerns
- Internal contract, can change freely

**Generic Structure**:
```
Result Object:
  - domain entity or value object
  - operation metadata: success flags, computed values
  - aggregated data from multiple sources
  - no infrastructure concerns
```

**Classification Pattern**:
- Transformations ✓ (aggregates multiple data sources)
- Sometimes: Validation Rules ✓
- Never: Business Rules, Domain Events, Side Effects, Identity Management

**Example Pattern**: `CreateOrderResult`, `PaymentProcessingResult`, `SearchResults`

---

### Key Differences: UI Response vs Application Response

| Aspect | User Interface Response | Application Response |
|--------|------------------------|---------------------|
| **Consumer** | External clients (API consumers) | Internal (UI layer) |
| **Types** | Primitives, serializable only | Domain objects allowed |
| **Contract** | External, versioned, stable | Internal, flexible |
| **Serialization** | Must be serializable | No serialization needed |
| **Purpose** | API contract | Data transfer between layers |
| **Change Impact** | Breaking changes for clients | Internal refactoring only |

---

## Possible Outsider Examples

### ✅ **MARK AS OUTSIDER**: Layer violation - Domain depending on Infrastructure
```kotlin
// Domain Entity with infrastructure concerns
@Entity
@Table(name = "users")
class User(
    @Id @GeneratedValue
    val id: Long,
    val email: String
) {
    fun save() {
        // Direct database access in domain!
        entityManager.persist(this)
    }
}
```
**Classification**: Possible outsider ✓ (infrastructure concerns in domain layer)

### ✅ **MARK AS OUTSIDER**: Mixed responsibilities - Value Object with identity
```kotlin
data class Address(
    val id: UUID,  // Value Objects shouldn't have identity!
    val street: String,
    val city: String
)
```
**Classification**: Possible outsider ✓ (value object with identity management)

### ✅ **MARK AS OUTSIDER**: Business logic in wrong layer
```kotlin
@RestController
class OrderController {
    @PostMapping("/orders")
    fun create(@RequestBody request: CreateOrderRequest): OrderResponse {
        // Business logic directly in controller!
        if (request.total < 10.00) throw MinimumOrderException()
        if (request.items.isEmpty()) throw EmptyOrderException()
        // ...
    }
}
```
**Classification**: Possible outsider ✓ (business rules in controller instead of domain/application layer)

### ✅ **MARK AS OUTSIDER**: Anemic domain model
```kotlin
class Order(
    val id: OrderId,
    var status: String,
    var total: BigDecimal
)
// Just getters/setters, no behavior - anemic model
```
**Classification**: Possible outsider ✓ (anemic domain model with no business behavior)

### ✅ **MARK AS OUTSIDER**: Consumer without idempotency
```kotlin
@Component
class PaymentConsumer {
    @RabbitListener(queues = ["payments"])
    fun consume(message: PaymentMessage) {
        // No idempotency check - will process duplicates!
        paymentService.processPayment(message)
    }
}
```
**Classification**: Possible outsider ✓ (consumer without idempotency protection)

### ❌ **DO NOT MARK**: Well-designed class following DDD principles
```kotlin
class Order(
    val id: OrderId,
    private val items: MutableList<OrderItem>
) {
    fun addItem(item: OrderItem) {
        require(items.size < MAX_ITEMS)
        items.add(item)
        recalculateTotal()
    }
}
```
**Classification**: Possible outsider ❌ (follows DDD principles correctly)

---

## Classification Anti-Patterns to Avoid

❌ **Marking everything**: Simple DTOs should have all columns ❌  
❌ **Confusing layers**: Validation Rules belong in infrastructure, not domain  
❌ **Missing obvious aspects**: Services with repositories must have External Dependencies ✓  
❌ **Over-classifying**: Not every calculation is a Transformation  
❌ **Under-classifying**: Aggregate Roots coordinating children must have Aggregate Consistency ✓

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
- [ ] Event publishers/message producers have Outbound communication ✓
- [ ] Integration event classes crossing bounded contexts have Integration event ✓
- [ ] Classes with layer violations marked as Possible outlier ✓
- [ ] Classes with mixed responsibilities marked as Possible outlier ✓
- [ ] Anemic domain models marked as Possible outlier ✓
- [ ] Event consumers without idempotency marked as Possible outlier ✓
