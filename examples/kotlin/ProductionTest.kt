package com.example.production

import com.example.User
import com.example.Logger
import com.example.DatabaseHelper

/**
 * Production-ready Kotlin class demonstrating various dependency patterns
 */
@Deprecated("Use ProductionTestV2 instead")
@SuppressWarnings("unused")
data class ProductionTest(
    val id: Long,
    val name: String,
    val users: List<User>,
    val optionalValue: String? = null
) : BaseEntity<Long>, Auditable {
    
    // Property with complex generic type
    private val userMap: Map<String, List<User>> = emptyMap()
    
    // Property with nullable generic
    private val logger: Logger? = null
    
    // Companion object implementing interface
    companion object Factory : EntityFactory<ProductionTest> {
        override fun create(params: Map<String, Any>): ProductionTest {
            val db = DatabaseHelper()
            return ProductionTest(
                id = params["id"] as Long,
                name = params["name"] as String,
                users = emptyList()
            )
        }
    }
    
    // Function with custom return type
    fun getActiveUsers(): Result<List<User>> {
        return Result.success(users.filter { it.isActive })
    }
    
    // Function with complex generic parameters
    fun processData(
        processor: DataProcessor<User>,
        transformer: (User) -> UserDTO
    ): Pair<Int, List<UserDTO>> {
        val processed = users.map { transformer(it) }
        return Pair(processed.size, processed)
    }
    
    // Override from interface
    override fun audit(): AuditRecord {
        return AuditRecord(
            entityId = id,
            entityType = "ProductionTest",
            timestamp = System.currentTimeMillis()
        )
    }
}

// Nested sealed class
sealed class ProcessingResult {
    data class Success(val data: ProductionTest) : ProcessingResult()
    data class Error(val message: String, val cause: Throwable?) : ProcessingResult()
    object Loading : ProcessingResult()
}

// Interface with generic
interface EntityFactory<T> {
    fun create(params: Map<String, Any>): T
}

// Interface
interface Auditable {
    fun audit(): AuditRecord
}

// Base class with generic
abstract class BaseEntity<ID> {
    abstract val id: ID
}
