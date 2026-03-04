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
