# DDD Classification Examples (Condensed)

## Simple Examples by Classification

### Integration Rules

✅ **Consumer filtering external data**
```kotlin
class PaymentEventConsumer {
    fun consume(event: PaymentEvent) {
        if (event.source != "payment-gateway") return  // Integration Rule
        if (event.paymentType !in SUPPORTED_TYPES) return
        processPayment(event)
    }
}
```
**Classification**: Integration Rules ✓, Inbound communication ✓

---

### Validation Rules

✅ **Technical format validation in mapper**
```kotlin
class ProductMapper {
    fun toCommand(request: CreateProductRequest): CreateProductCommand {
        val price = request.price?.toBigDecimalOrNull()
            ?: throw ValidationException("price must be valid decimal")
        return CreateProductCommand(price)
    }
}
```
**Classification**: Validation Rules ✓, Transformations ✓

---

### Invariants

✅ **Structural integrity in Value Object**
```kotlin
data class Quantity(val value: Int) {
    init {
        require(value > 0) { "Quantity must be positive" }
        require(value <= 999999) { "Quantity exceeds maximum" }
    }
}
```
**Classification**: Invariants ✓

---

### Business Rules

✅ **Business policy in service**
```kotlin
class ApplyDiscountService {
    fun execute(order: Order, coupon: Coupon) {
        require(order.status == ACTIVE) // Business Rule
        require(!coupon.isExpired()) // Business Rule
        require(order.total >= coupon.minimumPurchase) // Business Rule
        order.applyDiscount(calculateDiscount(order, coupon))
    }
}
```
**Classification**: Business Rules ✓, External Dependencies ✓

---

### Factory/Creation Logic

✅ **Factory methods with defaults**
```kotlin
data class UserProfile(val userId: UserId, val displayName: String, val avatar: String?) {
    companion object {
        fun createDefault(userId: UserId) = UserProfile(
            userId = userId,
            displayName = "User ${userId.value}",
            avatar = null
        )
    }
}
```
**Classification**: Factory/Creation ✓

---

### Transformations

✅ **Unit conversions**
```kotlin
data class Weight(val grams: Double) {
    fun toKilograms() = grams / 1000.0
    fun toPounds() = grams / 453.592

    companion object {
        fun fromKilograms(kg: Double) = Weight(kg * 1000.0)
    }
}
```
**Classification**: Transformations ✓, Factory/Creation ✓

---

### Identity Management

✅ **Entity with ID-based equality**
```kotlin
class Product(val id: ProductId, var name: String, var price: Money) {
    override fun equals(other: Any?) = other is Product && id == other.id
    override fun hashCode() = id.hashCode()
}
```
**Classification**: Identity Management ✓

---

### Lifecycle Management

✅ **State transitions with validation**
```kotlin
class Loan(val id: LoanId, private var status: LoanStatus) {
    fun approve() {
        require(status == PENDING) { "Can only approve pending loans" }
        status = APPROVED
        DomainEvents.raise(LoanApprovedEvent(id))
    }
}
```
**Classification**: Lifecycle Management ✓, Domain Events ✓, Identity Management ✓

---

### Domain Events

✅ **Domain event class**
```kotlin
data class OrderPlacedEvent(
    val orderId: OrderId,
    val customerId: CustomerId,
    val placedAt: Instant
) : DomainEvent
```
**Classification**: Domain Events ✓

---

### Integration Event

✅ **Integration event with primitives**
```kotlin
// Located in: com.company.orders.infrastructure.events
data class OrderCompletedEvent(
    val orderId: String,              // Primitive, not domain OrderId
    val customerId: String,           // Primitive, not domain CustomerId
    val totalAmount: BigDecimal,
    val currency: String,
    val eventId: String,
    val eventVersion: Int
)
```
**Classification**: Integration event ✓

---

### Aggregate Consistency

✅ **Aggregate Root managing children**
```kotlin
class Order(
    val id: OrderId,
    private val items: MutableList<OrderItem> = mutableListOf()
) {
    fun addItem(product: Product, quantity: Int) {
        require(items.size < MAX_ITEMS)
        items.add(OrderItem(product, quantity))
        recalculateTotal() // Maintains consistency
    }

    private fun recalculateTotal() {
        total = items.sumOf { it.subtotal() }
    }
}
```
**Classification**: Aggregate Consistency ✓, Business Rules ✓, Identity Management ✓

---

### External Dependencies

✅ **Service with external API**
```kotlin
class GeocodeService(private val geocodingApi: GeocodingApi) {
    fun execute(address: Address): Coordinates {
        val result = geocodingApi.geocode(address)
        return Coordinates(result.lat, result.lng)
    }
}
```
**Classification**: External Dependencies ✓, Side Effects ✓, Outbound communication ✓

---

### Event Mapping

✅ **Translating external events**
```kotlin
class OrderEventConsumer(private val processOrder: ProcessOrderUseCase) {
    fun consume(external: ExternalOrderEvent) {
        val domain = OrderPlacedEvent(
            orderId = OrderId(external.order_id),
            customerId = CustomerId(external.customer_ref),
            total = Money(external.total_cents / 100)
        )
        processOrder.execute(domain)
    }
}
```
**Classification**: Event Mapping ✓, Inbound communication ✓

---

### Error Handling

✅ **Retry with dead letter queue**
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
**Classification**: Error Handling ✓, Inbound communication ✓, Outbound communication ✓

---

### Idempotency

✅ **Idempotency check**
```kotlin
class OrderConsumer(
    private val processedEvents: ProcessedEventRepository,
    private val processOrder: ProcessOrderUseCase
) {
    @Transactional
    fun consume(event: OrderPlacedEvent) {
        if (processedEvents.exists(event.eventId)) return
        processOrder.execute(event)
        processedEvents.save(event.eventId)
    }
}
```
**Classification**: Idempotency ✓, Transaction Management ✓, Inbound communication ✓

---

### Side Effects

✅ **Database writes and event publishing**
```kotlin
class CreateUserService(
    private val userRepo: UserRepository,
    private val eventPublisher: EventPublisher
) {
    fun execute(cmd: CreateUserCommand): User {
        val user = User(UserId.generate(), cmd.email, cmd.name)
        userRepo.save(user)
        eventPublisher.publish(UserCreatedEvent(user.id))
        return user
    }
}
```
**Classification**: Side Effects ✓, External Dependencies ✓, Outbound communication ✓

---

### Transaction Management

✅ **Service with @Transactional**
```kotlin
class TransferMoneyService(private val accountRepo: AccountRepository) {
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
**Classification**: Transaction Management ✓, External Dependencies ✓, Side Effects ✓

---

### Inbound Communication

✅ **REST controller**
```kotlin
@RestController
class OrderController(private val createOrder: CreateOrderUseCase) {
    @PostMapping("/orders")
    fun create(@RequestBody request: CreateOrderRequest): OrderResponse {
        val order = createOrder.execute(request.toCommand())
        return OrderResponse.from(order)
    }
}
```
**Classification**: Inbound communication ✓, Validation Rules ✓

---

### Outbound Communication

✅ **API Client**
```kotlin
class UserServiceApiClient(
    private val httpClient: HttpClient,
    private val retryPolicy: RetryPolicy
) : UserServicePort {
    fun findUser(userId: UserId): User? {
        return retryPolicy.execute {
            val response = httpClient.get("/users/${userId.value}")
            when (response.status) {
                200 -> response.body<UserDto>().toDomain()
                404 -> null
                else -> throw ExternalServiceException(response.status)
            }
        }
    }
}
```
**Classification**: Outbound communication ✓, External Dependencies ✓, Side Effects ✓, Error Handling ✓, Transformations ✓

✅ **Event publisher**
```kotlin
class OrderEventPublisher(private val eventBus: EventBus) {
    fun publish(event: OrderPlacedEvent) {
        val message = OrderEventMessage(
            orderId = event.orderId.value,
            customerId = event.customerId.value
        )
        eventBus.publish("orders.placed", message)
    }
}
```
**Classification**: Outbound communication ✓, External Dependencies ✓, Side Effects ✓

---

## Complex Multi-Aspect Examples

### Example 1: Full-Featured Aggregate

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
- Invariants ✓
- Business Rules ✓
- Identity Management ✓
- Lifecycle Management ✓
- Domain Events ✓
- Aggregate Consistency ✓
- Transformations ✓

---

### Example 2: Application Service

```kotlin
class ProcessPaymentService(
    private val accountRepo: AccountRepository,
    private val userRepo: UserRepository,
    private val fraudDetector: FraudDetector
) {
    @Transactional
    fun execute(cmd: ProcessPaymentCommand) {
        val user = userRepo.findById(cmd.userId) ?: throw UserNotFoundException()

        if (!user.isVerified()) throw UnverifiedUserException()
        if (user.hasOverduePayments()) throw OverduePaymentsException()

        val account = accountRepo.findById(cmd.accountId) ?: throw AccountNotFoundException()

        if (!fraudDetector.isLegitimate(cmd)) throw FraudDetectedException()

        account.processPayment(cmd.amount)
        accountRepo.save(account)
    }
}
```

**Classification:**
- Business Rules ✓
- External Dependencies ✓
- Side Effects ✓
- Transaction Management ✓

---

### Example 3: Full Integration Consumer

```kotlin
class OrderEventConsumer(
    private val processedEvents: ProcessedEventRepository,
    private val processOrder: ProcessOrderUseCase,
    private val deadLetterQueue: DeadLetterQueue
) {
    @KafkaListener(topics = ["external-orders"])
    fun consume(external: ExternalOrderEvent) {
        // Integration Rule
        if (external.source != "order-api") return

        // Idempotency check
        if (processedEvents.exists(external.eventId)) return

        try {
            // Event Mapping
            val domain = OrderPlacedEvent(
                orderId = OrderId(external.order_id),
                customerId = CustomerId(external.customer_ref),
                total = Money(external.total_cents / 100)
            )

            processOrder.execute(domain)
            processedEvents.save(external.eventId)
        } catch (e: Exception) {
            // Error Handling
            deadLetterQueue.send(external, e.message)
        }
    }
}
```

**Classification:**
- Integration Rules ✓
- Event Mapping ✓
- Idempotency ✓
- Error Handling ✓
- External Dependencies ✓
- Side Effects ✓
- Inbound communication ✓
- Outbound communication ✓

---

## Possible Outsider Examples

### ✅ Layer violation - Domain depending on Infrastructure
```kotlin
@Entity
@Table(name = "users")
class User(
    @Id @GeneratedValue val id: Long,
    val email: String
) {
    fun save() {
        entityManager.persist(this) // Infrastructure in domain!
    }
}
```
**Classification**: Possible outsider ✓

---

### ✅ Mixed responsibilities - Value Object with identity
```kotlin
data class Address(
    val id: UUID,  // Value Objects shouldn't have identity!
    val street: String,
    val city: String
)
```
**Classification**: Possible outsider ✓

---

### ✅ Business logic in wrong layer
```kotlin
@RestController
class OrderController {
    @PostMapping("/orders")
    fun create(@RequestBody request: CreateOrderRequest): OrderResponse {
        if (request.total < 10.00) throw MinimumOrderException() // Business logic!
        // ...
    }
}
```
**Classification**: Possible outsider ✓

---

### ✅ Anemic domain model
```kotlin
class Order(
    val id: OrderId,
    var status: String,
    var total: BigDecimal
)
// Just getters/setters, no behavior
```
**Classification**: Possible outsider ✓

---

### ✅ Consumer without idempotency
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
**Classification**: Possible outsider ✓

---

## Anti-Patterns to Avoid

❌ **Marking everything**: Simple DTOs should have all columns ❌
❌ **Confusing layers**: Validation Rules are in infrastructure, not domain
❌ **Missing obvious**: Services with repositories need External Dependencies ✓
❌ **Value Objects with Identity Management**: Never mark this
❌ **Integration Events as Domain Events**: Different layers and purposes

---

## Simple Examples for New DDD Categories

### Event Handler (Application)

✅ **Application-layer handler responding to published events**
```kotlin
class UserRegisteredEventHandler(
    private val sendWelcomeEmail: SendWelcomeEmailUseCase,
    private val processedEvents: ProcessedEventRepository
) {
    fun handle(event: UserRegisteredEvent) {
        if (processedEvents.exists(event.eventId)) return
        sendWelcomeEmail.execute(SendWelcomeEmailCommand(event.userId, event.email))
        processedEvents.save(event.eventId)
    }
}
```
**Classification**: Inbound communication ✓, Event Mapping ✓, External Dependencies ✓, Side Effects ✓, Idempotency ✓

---

### Factory (Domain)

✅ **Dedicated factory class with complex creation rules**
```kotlin
class LoanApplicationFactory(
    private val creditScoreService: CreditScoreService,
    private val riskPolicy: LoanRiskPolicy
) {
    fun create(applicant: Applicant, amount: Money): LoanApplication {
        val creditScore = creditScoreService.evaluate(applicant)
        val riskLevel = riskPolicy.assess(creditScore, amount)
        return LoanApplication(
            id = LoanApplicationId.generate(),
            applicant = applicant,
            amount = amount,
            riskLevel = riskLevel,
            status = LoanStatus.PENDING
        )
    }
}
```
**Classification**: Factory/Creation ✓, Business Rules ✓, External Dependencies ✓

---

### Specification (Domain)

✅ **Composable business rule predicate**
```kotlin
class EligibleForPremiumDiscountSpecification(
    private val minimumTotal: Money,
    private val minimumOrderCount: Int
) {
    fun isSatisfiedBy(customer: Customer, order: Order): Boolean {
        return order.total >= minimumTotal &&
               customer.completedOrderCount >= minimumOrderCount &&
               !customer.hasOutstandingBalance()
    }

    fun and(other: EligibleForPremiumDiscountSpecification) =
        CompositeSpecification(this, other)
}
```
**Classification**: Business Rules ✓

---

### Policy (Domain)

✅ **Pluggable strategy for a business decision**
```kotlin
interface TaxCalculationPolicy {
    fun calculate(order: Order, destination: Address): Tax
}

class StandardTaxPolicy : TaxCalculationPolicy {
    override fun calculate(order: Order, destination: Address): Tax =
        Tax(order.subtotal * STANDARD_RATE)
}

class ExemptTaxPolicy : TaxCalculationPolicy {
    override fun calculate(order: Order, destination: Address): Tax =
        Tax(Money.ZERO)
}
```
**Classification**: Business Rules ✓

---

### Saga (Domain)

✅ **Multi-step workflow with compensating actions**
```kotlin
class PurchaseOrderSaga(
    private val inventoryService: InventoryService,
    private val paymentService: PaymentService,
    private val notificationService: NotificationService,
    private val sagaStateRepository: SagaStateRepository
) {
    @Transactional
    fun execute(command: CreatePurchaseOrderCommand): SagaResult {
        val sagaId = SagaId.generate()
        try {
            inventoryService.reserve(command.items)
            sagaStateRepository.markStep(sagaId, "INVENTORY_RESERVED")

            paymentService.authorize(command.paymentDetails)
            sagaStateRepository.markStep(sagaId, "PAYMENT_AUTHORIZED")

            notificationService.sendConfirmation(command.customerId)
            return SagaResult.success(sagaId)
        } catch (e: Exception) {
            compensate(sagaId, command)
            return SagaResult.failure(sagaId, e)
        }
    }

    private fun compensate(sagaId: SagaId, command: CreatePurchaseOrderCommand) {
        val completedSteps = sagaStateRepository.getCompletedSteps(sagaId)
        if ("PAYMENT_AUTHORIZED" in completedSteps) paymentService.void(command.paymentDetails)
        if ("INVENTORY_RESERVED" in completedSteps) inventoryService.release(command.items)
    }
}
```
**Classification**: External Dependencies ✓, Transaction Management ✓, Error Handling ✓, Side Effects ✓, Business Rules ✓

---

### Mapper (Infrastructure)

✅ **Transforming between domain objects and external representations**
```kotlin
class OrderMapper {
    fun toDomain(entity: OrderEntity): Order {
        return Order(
            id = OrderId(entity.id),
            customerId = CustomerId(entity.customerId),
            total = Money(entity.totalAmount, Currency.of(entity.currency)),
            status = OrderStatus.valueOf(entity.status)
        )
    }

    fun toEntity(order: Order): OrderEntity {
        val total = order.total?.toBigDecimalOrNull()
            ?: throw MappingException("Invalid total in order ${order.id}")
        return OrderEntity(
            id = order.id.value,
            customerId = order.customerId.value,
            totalAmount = total,
            currency = order.total.currency.code,
            status = order.status.name
        )
    }
}
```
**Classification**: Validation Rules ✓, Transformations ✓

---

### Adapter (Infrastructure)

✅ **Wrapping an external library to match domain interface**
```kotlin
// Domain interface
interface NotificationPort {
    fun sendEmail(to: EmailAddress, subject: String, body: String)
}

// Adapter — wraps SendGrid SDK to implement domain interface
class SendGridNotificationAdapter(
    private val sendGridClient: SendGrid
) : NotificationPort {
    override fun sendEmail(to: EmailAddress, subject: String, body: String) {
        val email = Email()
        email.addTo(to.value)
        email.subject = subject
        email.addContent("text/html", body)
        try {
            sendGridClient.api(Request().apply { method = POST; endpoint = "mail/send" })
        } catch (e: IOException) {
            throw NotificationException("Failed to send email via SendGrid", e)
        }
    }
}
```
**Classification**: Outbound communication ✓, External Dependencies ✓, Transformations ✓, Error Handling ✓, Side Effects ✓

---

### Projection (Infrastructure)

✅ **Building read model by consuming domain events**
```kotlin
class OrderProjection(
    private val orderReadModelRepo: OrderReadModelRepository,
    private val processedEvents: ProcessedEventRepository
) {
    @EventHandler
    fun on(event: OrderPlacedEvent) {
        if (processedEvents.exists(event.eventId)) return
        orderReadModelRepo.save(
            OrderReadModel(
                orderId = event.orderId.value,
                customerName = event.customerName,
                total = event.total.amount,
                status = "PLACED",
                placedAt = event.occurredOn
            )
        )
        processedEvents.save(event.eventId)
    }

    @EventHandler
    fun on(event: OrderShippedEvent) {
        orderReadModelRepo.updateStatus(event.orderId.value, "SHIPPED")
    }
}
```
**Classification**: Event Mapping ✓, Inbound communication ✓, Side Effects ✓, External Dependencies ✓, Idempotency ✓, Transformations ✓

---

### Read Model (Infrastructure)

✅ **Optimized query view for CQRS read side**
```kotlin
data class OrderSummaryReadModel(
    val orderId: String,
    val customerName: String,
    val totalAmount: BigDecimal,
    val currency: String,
    val status: String,
    val itemCount: Int,
    val placedAt: String,
    val lastUpdatedAt: String
) {
    fun toResponse() = OrderSummaryResponse(
        id = orderId,
        customer = customerName,
        total = "$totalAmount $currency",
        status = status,
        items = itemCount,
        date = placedAt
    )
}
```
**Classification**: Transformations ✓

