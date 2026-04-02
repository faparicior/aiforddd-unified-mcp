# DDD Classification Critical Distinctions

## Purpose
This guide highlights the **most commonly confused** classification scenarios to improve accuracy on edge cases.

---

## Top 10 Classification Mistakes

### 1. ❌ Value Objects marked with Identity Management
**WRONG**:
```kotlin
data class Email(val value: String) // Marked: Identity Management ✓
```

**RIGHT**: Value Objects use **structural equality**, never identity
```kotlin
data class Email(val value: String) // Identity Management ❌
```

**Rule**: Only mark Identity Management ✓ for Entities/Aggregates with ID-based equals()

---

### 2. ❌ Mapper validation marked as Invariants
**WRONG**:
```kotlin
class OrderMapper {
    fun toCommand(request: CreateOrderRequest) {
        val total = request.total?.toBigDecimalOrNull()
            ?: throw ValidationException("Invalid total")
    }
}
// Marked: Invariants ✓
```

**RIGHT**: This is **technical format validation** at infrastructure boundary
```kotlin
// Correct: Validation Rules ✓, Transformations ✓
// NOT Invariants (that's for domain objects)
```

**Rule**:
- **Invariants** ✓ → Domain layer (Value Objects, Entities) in init/constructor
- **Validation Rules** ✓ → Infrastructure layer (Mappers, Controllers)

---

### 3. ❌ Integration Events marked as Domain Events
**WRONG**:
```kotlin
// Located in: infrastructure.events
data class OrderCompletedEvent(
    val orderId: String,        // Primitive!
    val totalAmount: BigDecimal,
    val eventId: String
)
// Marked: Domain Events ✓
```

**RIGHT**: Uses primitives and is in infrastructure layer
```kotlin
// Correct: Integration event ✓
// NOT Domain Events (uses domain types like OrderId)
```

**Key Differences**:
| Aspect | Domain Event | Integration Event |
|--------|--------------|-------------------|
| **Layer** | Domain | Infrastructure |
| **Types** | OrderId, CustomerId | String, String |
| **Purpose** | Internal bounded context | Cross-context/external |
| **Metadata** | No eventId, version | Has eventId, version |

**Rule**: If it uses **primitives** (String, Int) instead of domain types (OrderId, CustomerId) → Integration event ✓

---

### 4. ❌ Business logic in controllers not marked as Possible outsider
**WRONG**:
```kotlin
@RestController
class OrderController {
    @PostMapping("/orders")
    fun create(@RequestBody request: CreateOrderRequest) {
        if (request.total < 10.00) throw MinimumOrderException()
        if (request.items.size > 100) throw TooManyItemsException()
        // ...
    }
}
// Marked: Inbound communication ✓
// NOT marked: Possible outsider
```

**RIGHT**: Business rules belong in domain/application layer, not UI layer
```kotlin
// Correct: Inbound communication ✓, Possible outsider ✓
// Business logic in controller is a layer violation!
```

**Rule**: If controller contains **business validation beyond format checks** → Possible outsider ✓

---

### 5. ❌ Services with repositories missing External Dependencies
**WRONG**:
```kotlin
class CreateOrderService(
    private val orderRepository: OrderRepository,
    private val customerRepository: CustomerRepository
) {
    fun execute(command: CreateOrderCommand) { ... }
}
// Marked: Business Rules ✓
// NOT marked: External Dependencies
```

**RIGHT**: Any service with repository/API dependencies
```kotlin
// Correct: Business Rules ✓, External Dependencies ✓, Side Effects ✓
```

**Rule**: If class has **repository, API client, or external service** parameters → External Dependencies ✓

---

### 6. ❌ Event consumers missing Idempotency
**WRONG**:
```kotlin
@Component
class NotificationConsumer {
    @KafkaListener(topics = ["notifications"])
    fun consume(event: NotificationEvent) {
        emailService.send(event.toEmail())
    }
}
// Marked: Inbound communication ✓
// NOT marked: Idempotency, Possible outsider
```

**RIGHT**: Consumers MUST handle duplicate messages
```kotlin
// Without idempotency check, will send duplicate emails!
// Correct: Inbound communication ✓, Possible outsider ✓
// Missing pattern: Idempotency check
```

**Rule**: Event consumers without idempotency checks → Possible outsider ✓

---

### 7. ❌ @Transactional services missing Transaction Management
**WRONG**:
```kotlin
class TransferMoneyService {
    @Transactional  // <-- Transaction annotation present!
    fun execute(command: TransferMoneyCommand) {
        val from = accountRepo.findById(command.fromId)
        val to = accountRepo.findById(command.toId)
        from.withdraw(command.amount)
        to.deposit(command.amount)
        accountRepo.save(from)
        accountRepo.save(to)
    }
}
// Marked: Business Rules ✓, External Dependencies ✓
// NOT marked: Transaction Management
```

**RIGHT**: @Transactional means it coordinates transactions
```kotlin
// Correct: Business Rules ✓, External Dependencies ✓,
//          Side Effects ✓, Transaction Management ✓
```

**Rule**: If class has **@Transactional, explicit transactions, or saga patterns** → Transaction Management ✓

---

### 8. ❌ Simple calculations marked as Transformations
**WRONG**:
```kotlin
class Order(val items: List<OrderItem>) {
    fun getTotal() = items.sumOf { it.price }
    // Marked: Transformations ✓
}
```

**RIGHT**: Simple aggregation/calculation is NOT transformation
```kotlin
// Transformations are for:
// - Unit conversion (meters → kilometers)
// - Format conversion (domain → DTO)
// - Complex derivations
// Simple sum() is just a calculation, not transformation
```

**Rule**: Only mark Transformations ✓ for **format/unit conversions or cross-representation mappings**

---

### 9. ❌ Confusing minimum thresholds: Invariants vs Business Rules
**WRONG** (marking only one):
```kotlin
class Order(val totalAmount: BigDecimal) {
    init {
        require(totalAmount >= BigDecimal.ZERO)  // Structural integrity
        require(totalAmount >= MIN_ORDER_AMOUNT) // Business policy
    }
    companion object {
        private val MIN_ORDER_AMOUNT = BigDecimal("10.00")
    }
}
// Marked: Invariants ✓ only
```

**RIGHT**: Can have BOTH invariants and business rules
```kotlin
// Correct: Invariants ✓ (negative amount is invalid)
//          Business Rules ✓ (minimum threshold is policy)
```

**Decision Guide**:
| Validation | Type | Reason |
|------------|------|--------|
| `amount >= 0` | Invariants ✓ | Negative amount is structurally invalid |
| `amount <= MAX_VALUE` | Invariants ✓ | System limit (e.g., database constraint) |
| `amount >= MIN_ORDER` | Business Rules ✓ | Business policy that can change |
| `amount < REVIEW_THRESHOLD` | Business Rules ✓ | Business workflow rule |

**Rule**: Mark **BOTH** when class has structural + policy constraints

---

### 10. ❌ Anemic models not marked as Possible outsider
**WRONG**:
```kotlin
class Order(
    val id: OrderId,
    var status: String,
    var items: MutableList<OrderItem>,
    var total: BigDecimal
)
// Just properties, no behavior
// Marked: Identity Management ✓
// NOT marked: Possible outsider
```

**RIGHT**: Anemic models are DDD anti-patterns
```kotlin
// Should have methods like:
// - fun addItem(item: OrderItem)
// - fun submit()
// - fun cancel()
// Pure data classes in domain layer violate DDD principles
// Correct: Identity Management ✓, Possible outsider ✓
```

**Rule**: Domain entities with **only properties and no behavior** → Possible outsider ✓

---

## Critical Distinctions Deep Dive

### Distinction 1: Invariants vs. Business Rules vs. Validation Rules

```kotlin
// VALIDATION RULE (Infrastructure - Mapper)
class CreateOrderMapper {
    fun toCommand(request: CreateOrderRequest) {
        val quantity = request.quantity?.toIntOrNull()  // ← Format check
            ?: throw ValidationException("quantity must be integer")
        // Classification: Validation Rules ✓
    }
}

// INVARIANT (Domain - Value Object)
data class Quantity(val value: Int) {
    init {
        require(value > 0) { "Quantity must be positive" }  // ← Structural integrity
        require(value <= 999999) { "Quantity within system limits" }
    }
    // Classification: Invariants ✓
}

// BUSINESS RULE (Domain - Entity/Service)
class Order {
    fun addItem(product: Product, quantity: Quantity) {
        require(items.size < 10) { "Maximum 10 items per order" }  // ← Business policy
        // Classification: Business Rules ✓
    }
}
```

**Quick Test**:
- Is it checking **data format/type**? → Validation Rules ✓
- Would violating it make the object **fundamentally invalid**? → Invariants ✓
- Is it a **changeable business policy**? → Business Rules ✓

---

### Distinction 2: Domain Events vs. Integration Events

```kotlin
// DOMAIN EVENT (stays within bounded context)
package com.company.orders.domain.events

data class OrderPlacedEvent(
    val orderId: OrderId,           // ← Domain type
    val customerId: CustomerId,     // ← Domain type
    val items: List<OrderItem>,     // ← Domain aggregate children
    val placedAt: Instant           // ← Domain type
) : DomainEvent
// Classification: Domain Events ✓

// INTEGRATION EVENT (crosses bounded contexts)
package com.company.orders.infrastructure.events

data class OrderPlacedIntegrationEvent(
    val orderId: String,            // ← Primitive for serialization
    val customerId: String,         // ← Primitive
    val totalAmount: BigDecimal,    // ← Simple types only
    val currency: String,
    val eventId: String,            // ← Event metadata
    val eventVersion: Int,          // ← Event metadata
    val timestamp: Long             // ← Unix timestamp
)
// Classification: Integration event ✓
```

**Quick Test**:
- Uses domain types (OrderId, CustomerId)? → Domain Events ✓
- Uses primitives (String, Int) with eventId/version? → Integration event ✓
- Has domain aggregate children? → Domain Events ✓
- Designed for JSON/Avro serialization? → Integration event ✓

---

### Distinction 3: Side Effects vs. Transformations

```kotlin
// TRANSFORMATION (pure function)
class PriceCalculator {
    fun calculateTotal(items: List<Item>, discount: Discount): Money {
        val subtotal = items.sumOf { it.price }
        return subtotal - (subtotal * discount.percentage)
    }
}
// Just calculates and returns - NO side effects
// Classification: Transformations ✓

// SIDE EFFECTS (changes external state)
class OrderService(
    private val orderRepo: OrderRepository,
    private val eventPublisher: EventPublisher
) {
    fun createOrder(command: CreateOrderCommand): Order {
        val order = Order(...)
        orderRepo.save(order)              // ← Side effect: database
        eventPublisher.publish(...)         // ← Side effect: message broker
        return order
    }
}
// Classification: Side Effects ✓, External Dependencies ✓, Outbound communication ✓
```

**Quick Test**:
- Only computes and returns? → Transformations ✓ (NOT Side Effects)
- Writes to database/file/network? → Side Effects ✓
- Publishes events/messages? → Side Effects ✓ + Outbound communication ✓

---

### Distinction 4: Inbound vs. Outbound Communication

```kotlin
// INBOUND (receives from external)
@RestController
class OrderController {
    @PostMapping("/orders")  // ← Receives HTTP requests
    fun create(@RequestBody request: CreateOrderRequest) { ... }
}
// Classification: Inbound communication ✓

@Component
class OrderConsumer {
    @KafkaListener(topics = ["orders"])  // ← Consumes messages
    fun consume(message: OrderMessage) { ... }
}
// Classification: Inbound communication ✓

// OUTBOUND (sends to external)
class NotificationClient(private val httpClient: HttpClient) {
    fun sendEmail(email: Email) {
        httpClient.post("https://api.sendgrid.com/...") // ← Makes API calls
    }
}
// Classification: Outbound communication ✓

class OrderEventPublisher(private val kafka: KafkaTemplate) {
    fun publish(event: OrderEvent) {
        kafka.send("orders", event)  // ← Publishes messages
    }
}
// Classification: Outbound communication ✓
```

**Quick Test**:
- Has @RestController, @PostMapping, @GetMapping? → Inbound communication ✓
- Has @KafkaListener, @RabbitListener, @EventListener? → Inbound communication ✓
- Makes HTTP calls (httpClient.get/post)? → Outbound communication ✓
- Publishes to Kafka/RabbitMQ? → Outbound communication ✓

---

## Edge Case Guidance

### Edge Case 1: Enums with validation
```kotlin
// Simple enum - NO invariants
enum class Status { ACTIVE, INACTIVE, PENDING }
// Classification: All columns ❌

// Enum with validation - HAS invariants
enum class PaymentType(val code: String) {
    CREDIT_CARD("CC"), DEBIT_CARD("DC");

    companion object {
        fun fromCode(code: String) = entries.find { it.code == code }
            ?: throw IllegalArgumentException("Invalid payment type")
    }
}
// Classification: Invariants ✓ (validation in companion object)
```

---

### Edge Case 2: Repository interfaces
```kotlin
// Repository INTERFACE - just contract
interface OrderRepository {
    fun save(order: Order)
    fun findById(id: OrderId): Order?
}
// Classification: All columns ❌ (it's just an interface)

// Repository IMPLEMENTATION - has side effects
class OrderRepositoryImpl : OrderRepository {
    override fun save(order: Order) {
        entityManager.persist(order)  // Database I/O
    }
}
// Classification: Side Effects ✓, External Dependencies ✓
```

---

### Edge Case 3: Response objects
```kotlin
// User Interface Response (external API)
data class OrderResponse(
    val orderId: String,
    val totalAmount: BigDecimal,
    val status: String
) {
    companion object {
        fun from(order: Order) = OrderResponse(
            orderId = order.id.value,
            totalAmount = order.total.amount,
            status = order.status.name
        )
    }
}
// Classification: Transformations ✓ (domain → API format)

// Simple DTO with no logic
data class CreateOrderRequest(
    val customerId: String,
    val items: List<ItemRequest>
)
// Classification: All columns ❌
```

---

### Edge Case 4: Mixed invariants and business rules
```kotlin
class Subscription(
    val plan: Plan,
    val startDate: LocalDate,
    val endDate: LocalDate
) {
    init {
        // INVARIANT: Structural integrity
        require(endDate.isAfter(startDate)) {
            "End date must be after start date"
        }

        // BUSINESS RULE: Business policy
        val duration = ChronoUnit.DAYS.between(startDate, endDate)
        require(duration >= MIN_SUBSCRIPTION_DAYS) {
            "Minimum subscription period is $MIN_SUBSCRIPTION_DAYS days"
        }
    }

    companion object {
        private const val MIN_SUBSCRIPTION_DAYS = 30L
    }
}
// Classification: Invariants ✓ AND Business Rules ✓
```

---

## Validation Checklist for Edge Cases

Before finalizing, double-check these patterns:

**Always mark if present**:
- [ ] Value Objects → NEVER Identity Management
- [ ] @Transactional → Transaction Management ✓
- [ ] Repository parameters → External Dependencies ✓
- [ ] Database/file/network I/O → Side Effects ✓
- [ ] REST endpoints → Inbound communication ✓
- [ ] API calls/publishing → Outbound communication ✓
- [ ] Primitive types + eventId → Integration event ✓
- [ ] Domain types (OrderId) → Domain Events ✓ (NOT Integration event)

**Red flags for Possible outsider**:
- [ ] Business logic in controllers
- [ ] Database annotations in domain entities
- [ ] Anemic models (only properties, no methods)
- [ ] Domain depending on infrastructure
- [ ] Event consumers without idempotency
- [ ] Value Objects with identity/ID properties

---

## When in Doubt

### Priority Order for Classification:

1. **Check layer first** (Domain vs. Infrastructure vs. Application)
2. **Check data types** (Domain types vs. Primitives)
3. **Check where validation occurs** (Constructor vs. Mapper vs. Service)
4. **Check dependencies** (Repositories? APIs? External services?)
5. **Check I/O operations** (Database? Network? Message broker?)
6. **Check communication direction** (Receives requests? Makes API calls?)

### Most Critical to Get Right:

🔴 **High Priority** (most impact):
1. Integration Rules vs. Validation Rules vs. Invariants
2. Domain Events vs. Integration Events
3. Layer violations (Possible outsider)
4. External Dependencies (any repo/API usage)
5. Side Effects (any I/O operations)

🟡 **Medium Priority**:
6. Inbound vs. Outbound communication
7. Transaction Management (@Transactional)
8. Idempotency in consumers

🟢 **Lower Priority** (less ambiguous):
9. Identity Management (clear: Entity with ID)
10. Factory/Creation (clear: has factory methods)

---

## New Category Distinctions (Extended Categories)

### 11. ❌ Factory DDD category vs. entity-level factory method
**WRONG**: Treating any class with a factory method as a Factory DDD category
```kotlin
// This is an ENTITY with a factory method — NOT a Factory DDD category
class Order(val id: OrderId) {
    companion object {
        fun create(customerId: CustomerId) = Order(OrderId.generate())
    }
}
// Includes factory method but Category = "Entity", not "Factory"
```

**RIGHT**: A Factory DDD category is a dedicated class whose sole responsibility is creating domain objects with complex rules
```kotlin
// This IS a Factory DDD category
class OrderFactory(
    private val pricingService: PricingService,
    private val inventoryService: InventoryService
) {
    fun createFromCart(cart: Cart, customer: Customer): Order {
        // Complex creation logic coordinating multiple domain rules
        val pricing = pricingService.calculate(cart, customer)
        val reservations = inventoryService.reserve(cart.items)
        return Order(OrderId.generate(), customer.id, pricing, reservations)
    }
}
// Category = "Factory", Classification: Business Rules ✓, Factory/Creation ✓
```

**Rule**: Factory category = **dedicated creation class** with complex domain rules, not just a factory method on an entity.

---

### 12. ❌ Specification vs. Domain Service vs. Business Rule column
**WRONG**: Using a Domain Service for every filtering/validation need
```kotlin
// Overloaded domain service (should be extracted to Specification)
class OrderEligibilityService {
    fun isEligibleForDiscount(order: Order): Boolean {
        return order.total >= DISCOUNT_THRESHOLD && !order.hasPromoCode()
    }
    // This filtering predicate is a Specification, not a Domain Service
}
```

**RIGHT**: Specification encapsulates composable business rules for filtering/querying
```kotlin
// Specification DDD category
class EligibleForDiscountSpecification {
    fun isSatisfiedBy(order: Order): Boolean {
        return order.total >= DISCOUNT_THRESHOLD && !order.hasPromoCode()
    }
}

// Composable specifications
val complexSpec = EligibleForDiscountSpecification()
    .and(NotExpiredSpecification())
    .and(ActiveCustomerSpecification())
```

**Rule**: Specification category = **composable predicate** encapsulating a business rule for filtering or validating domain objects.

---

### 13. ❌ Policy vs. Domain Service
**WRONG**: Treating Policy as just another Domain Service
```kotlin
// Should be Policy, not Domain Service
class ShippingCalculator {
    fun calculate(order: Order, destination: Address): Money {
        return if (order.isExpressDelivery) EXPRESS_RATE * order.weight
               else STANDARD_RATE * order.weight
        // Context-dependent decision with varying strategies
    }
}
```

**RIGHT**: Policy encapsulates a **replaceable business decision** using strategy/polymorphism
```kotlin
// Policy DDD category — strategy-based
interface ShippingPolicy {
    fun calculate(order: Order, destination: Address): Money
}

class ExpressShippingPolicy : ShippingPolicy { ... }
class StandardShippingPolicy : ShippingPolicy { ... }
class FreeShippingPolicy(private val threshold: Money) : ShippingPolicy { ... }
```

**Rule**: Policy category = **pluggable strategy** for a business decision that varies by context. Domain Service = logic that doesn't fit in an entity but isn't designed to be swapped.

---

### 14. ❌ Saga vs. Use Case (Application)
**WRONG**: Labeling a long-running workflow handler as a simple Use Case
```kotlin
// This is a Saga, not just a Use Case
class ProcessOrderService(
    private val orderRepo: OrderRepository,
    private val paymentService: PaymentService,
    private val inventoryService: InventoryService,
    private val compensationService: CompensationService
) {
    fun execute(command: ProcessOrderCommand) {
        val order = orderRepo.create(command)
        try {
            inventoryService.reserve(order.items) // Step 1
            paymentService.charge(order.total)    // Step 2
            order.confirm()                        // Step 3
        } catch (e: Exception) {
            compensationService.rollback(order)    // Compensation!
        }
    }
}
```

**RIGHT**: Sagas coordinate **distributed multi-step workflows** with compensating transactions
```kotlin
// Category = "Saga"
// Classification: External Dependencies ✓, Transaction Management ✓, Error Handling ✓, Side Effects ✓
```

**Key Difference**:
| Aspect | Use Case | Saga |
|--------|----------|------|
| **Scope** | Single bounded context | Multiple aggregates/services |
| **Compensation** | Not needed | Required for rollback |
| **Steps** | 1-3 operations | Multiple distributed steps |
| **State** | Stateless | Tracks saga state |

---

### 15. ❌ Adapter vs. API Client vs. Gateway
**WRONG**: Using all three terms interchangeably
```kotlin
// These are DIFFERENT categories:

// API Client — translates domain calls into HTTP calls
class PaymentApiClient(private val httpClient: HttpClient) {
    fun charge(amount: Money): PaymentResult {
        val response = httpClient.post("/charge", amount.toDto())
        return PaymentResult.from(response)
    }
}
// Category = "API client", Classification: Outbound communication ✓, External Dependencies ✓

// Gateway — aggregates multiple APIs with anti-corruption logic
class ShippingGateway(
    private val fedexClient: FedexApiClient,
    private val dhlClient: DhlApiClient
) {
    fun getBestRate(order: Order): ShippingQuote { ... }
}
// Category = "Gateway", Classification: Outbound communication ✓, Transformations ✓, External Dependencies ✓

// Adapter — wraps non-HTTP external concern to match domain interface
class SqlOrderRepositoryAdapter(private val jpaRepo: JpaOrderRepository) : OrderRepository {
    override fun findById(id: OrderId) = jpaRepo.findById(id.value)?.toDomain()
}
// Category = "Adapter", Classification: External Dependencies ✓, Transformations ✓
```

**Rule**:
- **API Client** = HTTP/REST caller for one external service
- **Gateway** = aggregates or translates across multiple APIs
- **Adapter** = wraps any external concern (DB, file, cache) to match a domain interface

---

### 16. ❌ Projection vs. Read model
**WRONG**: Treating them as identical concepts
```kotlin
// PROJECTION — actively BUILDS the read model from events
class OrderProjection {
    @EventHandler
    fun on(event: OrderPlacedEvent) {
        val view = OrderReadModel(event.orderId, event.total, "PLACED")
        readModelRepository.save(view)
    }
    // Category = "Projection", Classification: Event Mapping ✓, Inbound communication ✓, Side Effects ✓
}

// READ MODEL — the result data structure used for queries only
class OrderReadModel(
    val orderId: String,
    val total: BigDecimal,
    val status: String
)
// Category = "Read model", Classification: Transformations ✓
```

**Rule**:
- **Projection** = the event handler that **writes** the read model
- **Read model** = the data class or view that is **queried**

---

### 17. ❌ Event handler vs. Use Case (Application)
**WRONG**: Treating event-driven entry points identically to command-driven use cases
```kotlin
// This is an Event Handler, not a Use Case
class UserRegisteredEventHandler(
    private val sendWelcomeEmail: SendWelcomeEmailUseCase
) {
    fun handle(event: UserRegisteredEvent) {
        sendWelcomeEmail.execute(SendWelcomeEmailCommand(event.userId, event.email))
    }
}
// Category = "Event handler"
// Classification: Inbound communication ✓, External Dependencies ✓, Side Effects ✓, Event Mapping ✓
```

**RIGHT**: Use Cases respond to direct commands; Event Handlers respond to published events
```kotlin
// Use Case — triggered by a direct command from UI/API
class RegisterUserUseCase(private val userRepo: UserRepository) {
    fun execute(command: RegisterUserCommand): User { ... }
}
// Category = "Use case"
// Classification: Business Rules ✓, External Dependencies ✓, Side Effects ✓
```

**Key Difference**:
| Aspect | Use Case | Event Handler |
|--------|----------|---------------|
| **Triggered by** | Direct command from UI | Published event |
| **Contains logic** | Business rules | Orchestration only |
| **Idempotency** | Optional | Required |
| **Returns** | Result to caller | Nothing (fire and forget) |

