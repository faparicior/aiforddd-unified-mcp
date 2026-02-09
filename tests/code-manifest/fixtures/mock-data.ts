import type { ParsedFile, CodeClass, CodeFunction, CodeProperty, CodeConstant } from '../../../src/tools/code-manifest/classifier/parsers/index.js'
import type { ClassEntry } from '../../../src/tools/code-manifest/classifier/comparison/hash-comparer.js'
import type { ApplicationConfig } from '../../../src/tools/code-manifest/config/types.js'

/**
 * Mock Kotlin file structure for testing
 */
export const mockKotlinFile: ParsedFile = {
  package: 'com.example.app.domain',
  imports: [
    'java.util.UUID',
    'kotlinx.serialization.Serializable'
  ],
  language: 'kotlin',
  classes: [
    {
      name: 'User',
      type: 'data class',
      properties: [
        {
          name: 'id',
          type: 'UUID',
          visibility: 'public',
          metadata: { mutability: 'val', isCompanion: false }
        },
        {
          name: 'name',
          type: 'String',
          visibility: 'public',
          metadata: { mutability: 'val', isCompanion: false }
        },
        {
          name: 'email',
          type: 'String',
          visibility: 'public',
          metadata: { mutability: 'val', isCompanion: false }
        }
      ],
      functions: [
        {
          name: 'validate',
          visibility: 'public',
          parameters: [],
          returnType: 'Boolean',
          isOverride: false,
          isAsync: false,
          isStatic: false,
          metadata: { isCompanion: false }
        }
      ],
      constants: [],
      annotations: ['Serializable']
    }
  ],
  constants: [],
  functions: []
}

/**
 * Mock Kotlin class with multiple functions
 */
export const mockKotlinClassWithFunctions: CodeClass = {
  name: 'UserService',
  type: 'class',
  properties: [
    {
      name: 'repository',
      type: 'UserRepository',
      visibility: 'private',
      metadata: { mutability: 'val', isCompanion: false }
    }
  ],
  functions: [
    {
      name: 'createUser',
      visibility: 'public',
      parameters: [
        { name: 'name', type: 'String' },
        { name: 'email', type: 'String' }
      ],
      returnType: 'User',
      isOverride: false,
      isAsync: true,
      isStatic: false,
      metadata: { isCompanion: false },
      annotations: ['@Transactional']
    },
    {
      name: 'findUser',
      visibility: 'public',
      parameters: [
        { name: 'id', type: 'UUID' }
      ],
      returnType: 'User?',
      isOverride: false,
      isAsync: true,
      isStatic: false,
      metadata: { isCompanion: false }
    }
  ],
  constants: [],
  annotations: ['@Service']
}

/**
 * Mock class entries for comparison testing
 */
export const mockOldClassEntries: ClassEntry[] = [
  {
    status: '',
    identifier: 'abc123def456',
    contentHash: 'hash1234567890abcdef',
    alias: 'app1',
    catalogued: '2024-01-01',
    processed: '2024-01-01',
    class: 'User',
    file: 'src/domain/User.kt',
    type: 'Entity',
    layer: 'Domain',
    description: 'User entity'
  },
  {
    status: '',
    identifier: 'xyz789ghi012',
    contentHash: 'hash0987654321fedcba',
    alias: 'app1',
    catalogued: '2024-01-01',
    processed: '2024-01-01',
    class: 'UserService',
    file: 'src/application/UserService.kt',
    type: 'Service',
    layer: 'Application',
    description: 'User service'
  },
  {
    status: '',
    identifier: 'old111old222',
    contentHash: 'hasholdoldoldoldold',
    alias: 'app1',
    catalogued: '2024-01-01',
    processed: '2024-01-01',
    class: 'OldClass',
    file: 'src/domain/OldClass.kt',
    type: 'Entity',
    layer: 'Domain',
    description: 'Old class to be deleted'
  }
]

export const mockNewClassEntries: ClassEntry[] = [
  {
    status: '',
    identifier: 'abc123def456',
    contentHash: 'hash1234567890abcdef',
    alias: 'app1',
    catalogued: '2024-01-02',
    processed: '2024-01-02',
    class: 'User',
    file: 'src/domain/User.kt',
    type: 'Entity',
    layer: 'Domain',
    description: 'User entity'
  },
  {
    status: '',
    identifier: 'xyz789ghi012',
    contentHash: 'hashNEWNEWNEWNEWNEW',
    alias: 'app1',
    catalogued: '2024-01-02',
    processed: '2024-01-02',
    class: 'UserService',
    file: 'src/application/UserService.kt',
    type: 'Service',
    layer: 'Application',
    description: 'User service - modified'
  },
  {
    status: '',
    identifier: 'new333new444',
    contentHash: 'hashnewnewnewnewnew',
    alias: 'app1',
    catalogued: '2024-01-02',
    processed: '2024-01-02',
    class: 'NewClass',
    file: 'src/domain/NewClass.kt',
    type: 'Entity',
    layer: 'Domain',
    description: 'Newly added class'
  }
]

/**
 * Mock application configuration
 */
export const mockApplicationConfig: ApplicationConfig = {
  version: '1.0.0',
  app_details: [
    {
      path: '/tmp/test-project/src/main/kotlin',
      language: 'kotlin',
      mode: 'class',
      alias: 'test-app',
      type: 'code'
    },
    {
      path: '/tmp/test-project/src/test/kotlin',
      language: 'kotlin',
      mode: 'class',
      alias: 'test-app',
      type: 'test'
    }
  ],
  destination_folder: './output'
}

/**
 * Sample Kotlin code snippets for testing
 */
export const sampleKotlinCode = {
  simpleClass: `package com.example.app.domain

data class User(
    val id: UUID,
    val name: String,
    val email: String
)`,

  classWithFunctions: `package com.example.app.application

import com.example.app.domain.User
import java.util.UUID

@Service
class UserService(private val repository: UserRepository) {
    
    @Transactional
    suspend fun createUser(name: String, email: String): User {
        return repository.save(User(UUID.randomUUID(), name, email))
    }
    
    suspend fun findUser(id: UUID): User? {
        return repository.findById(id)
    }
}`,

  classWithCompanion: `package com.example.app.domain

class Constants {
    companion object {
        const val MAX_LENGTH = 100
        const val DEFAULT_TIMEOUT = 30
    }
}`,

  interface: `package com.example.app.domain

interface UserRepository {
    suspend fun save(user: User): User
    suspend fun findById(id: UUID): User?
    suspend fun findAll(): List<User>
}`,

  enum: `package com.example.app.domain

enum class UserRole {
    ADMIN,
    USER,
    GUEST
}`,

  sealedClass: `package com.example.app.domain

sealed class Result {
    data class Success(val data: String) : Result()
    data class Error(val message: String) : Result()
    object Loading : Result()
}`,

  classWithAnnotationOnSameLine: `package com.example.myapp.domain.events

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true) data class OrderCreatedEvent(val orderId: OrderId)`
}

/**
 * Sample markdown table content
 */
export const sampleMarkdownTable = `| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|
|  | abc123def456 | hash1234567890abcdef | app1 | 2024-01-01 | 2024-01-01 | User | src/domain/User.kt | Entity | Domain | User entity |
|  | xyz789ghi012 | hash0987654321fedcba | app1 | 2024-01-01 | 2024-01-01 | UserService | src/application/UserService.kt | Service | Application | User service |
`

/**
 * Sample markdown table with extended columns (like the full code template)
 */
export const sampleExtendedMarkdownTable = `| Status | Identifier | Content | Alias | Catalogued | Processed | Class | File | Type | Layer | Description | Integration Rules | Validation Rules | Invariants | Business rules | Factory/Creation | Transformations | Identity Management | Lifecycle Management | Domain Events | Integration event | Aggregate Consistency | External Dependencies | Event Mapping | Error Handling | Idempotency | Side Effects | Transaction Management |
|--------|------------|---------|-------|------------|-----------|-------|------|------|-------|-------------|-------------------|------------------|------------|----------------|------------------|-----------------|---------------------|----------------------|---------------|---|-----------------------|-----------------------|---------------|----------------|-------------|--------------|------------------------|
|  | abc123def456 | hash1234567890abcdef | app1 | 2024-01-01 | 2024-01-01 | User | src/domain/User.kt | Entity | Domain | User entity |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  | xyz789ghi012 | hash0987654321fedcba | app1 | 2024-01-01 | 2024-01-01 | UserService | src/application/UserService.kt | Service | Application | User service |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
`

/**
 * Sample configuration JSON
 */
export const sampleConfigJson = `{
  "app_details": [
    {
      "path": "./src/main/kotlin",
      "language": "kotlin",
      "mode": "class",
      "alias": "test-app",
      "type": "code"
    }
  ]
}`
