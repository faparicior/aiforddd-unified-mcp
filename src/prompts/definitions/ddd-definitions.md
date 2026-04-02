# DDD Definitions

## DDD layers
| Layer | Description |
|-------|-------------|
| User Interface | The user interface layer, handling user interactions and displaying information. |
| Application | Coordinates the domain logic and handles application-specific concerns. |
| Domain | The core business logic and rules of the application. |
| Infrastructure | Provides technical capabilities like persistence, messaging, and external integrations. |

## DDD Categories by Layer
| Category | Layer | Description |
|----------|-------|-------------|
| Controller | User Interface | Handles incoming requests and routes them to the appropriate services.|
| Event consumer | User Interface | Handles incoming events from message queues or streams.|
| Console command | User Interface | Provides a command-line interface for interacting with the application. |
| Scheduler | User Interface | Manages scheduled tasks and background jobs.|
| Response | User Interface | Represents the data structure returned from the user interface layer to external clients.|
| Command | Application | Defines application-specific commands for user interaction.|
| Query | Application | Defines application-specific queries to retrieve data.|
| Use case | Application | Defines application-specific operations and orchestrates domain logic.|
| Event handler | Application | Handles domain events or integration events from other bounded contexts or internal components, orchestrating application responses.|
| Response | Application | Represents the data structure returned from application services to the user interface layer.|
| Domain service | Domain | Contains business logic that doesn't naturally fit within an entity or value object.|
| Domain event | Domain | Represents a significant event that occurs within the domain, often used for event sourcing. |
| Domain interface | Domain | Defines contracts for domain services or repositories.|
| Entity | Domain | Represents a business object with a unique identity and lifecycle.|
| Aggregate root | Domain | A cluster of domain objects that can be treated as a single unit for data changes.|
| Value object | Domain | Represents a descriptive aspect of the domain without identity.|
| Factory | Domain | Encapsulates complex object creation logic, applying business rules and invariants during instantiation.|
| Specification | Domain | Encapsulates a business rule for querying, filtering, or validating domain objects in a reusable and composable way.|
| Policy | Domain | Encapsulates a changeable business decision or strategy that can vary by context, replacing conditional logic with polymorphism.|
| Saga | Domain | Orchestrates a multi-step business workflow across multiple aggregates or bounded contexts, managing state and compensating actions.|
| Domain exception | Domain | Exceptions that represent domain rule violations or business logic failures.|
| Repository | Infrastructure | Provides access to domain objects, typically through persistence mechanisms.|
| API client | Infrastructure | Implements outbound port interfaces to call external REST/HTTP APIs, translating domain calls into HTTP requests and parsing responses back into domain objects.|
| Gateway | Infrastructure | Facade that aggregates multiple external API calls or provides anti-corruption layer translation for complex external service integrations.|
| Event producer | Infrastructure | Publishes domain events or integration events to message brokers or event streams, implementing outbound messaging port interfaces.|
| Integration event | Infrastructure | Represents an event that communicates significant changes between bounded contexts or external systems.|
| Integration service | Infrastructure | Provides integration with external systems and services.|
| Mapper | Infrastructure | Transforms data between domain objects and external representations such as DTOs, database entities, or API response models.|
| Adapter | Infrastructure | Wraps an external system or library to conform to a domain interface contract, acting as an anti-corruption layer.|
| Projection | Infrastructure | Builds and maintains a read-optimized view model by consuming and processing domain events (CQRS read side).|
| Read model | Infrastructure | Provides optimized query views constructed from projected or aggregated data, used exclusively for reading.|
| Configuration | Infrastructure | Defines system configuration and setup for technical capabilities.|
| Infrastructure exception | Infrastructure | Exceptions related to technical concerns like database, network, or external service failures. |

## Test Types
| Test Type | Description |
|-----------|-------------|
| Unit Test | Tests individual components in isolation with mocks/stubs |
| Integration Test | Tests interaction between multiple components or external systems |
| End-to-End Test | Tests complete user workflows from start to finish |
| Contract Test | Tests API contracts and interfaces |
| Performance Test | Tests system performance, load, or stress |
| Acceptance Test | Tests business acceptance criteria and user stories |

## Response Definitions

See the simplified classification guide for detailed examples and patterns for Response objects in both User Interface and Application layers.

