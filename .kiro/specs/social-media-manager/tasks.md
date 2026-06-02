# Implementation Plan: Social Media Manager

## Overview

This implementation plan covers the full build-out of an AI-native social media manager application using TypeScript/Node.js backend, React frontend, Pulumi IaC, and integrations with Amazon Bedrock AgentCore, Cerebras AI, Vapi, and Apify. Tasks are structured to build foundational infrastructure and data layers first, then core services, agent layer, external integrations, and finally the frontend dashboard.

## Tasks

- [ ] 1. Set up project structure and core infrastructure
  - [ ] 1.1 Initialize monorepo structure with package.json, tsconfig, and workspace configuration
    - Create root monorepo with packages: `infra/`, `backend/`, `frontend/`, `shared/`
    - Configure TypeScript project references and path aliases
    - Set up ESLint, Prettier, and shared tsconfig base
    - Install fast-check as dev dependency for property-based testing
    - Configure Vitest as test runner
    - _Requirements: 8.3_

  - [ ] 1.2 Define shared TypeScript interfaces and types
    - Create `shared/src/types/platform.ts` with PlatformId, PlatformConnector, AuthResult, TokenData interfaces
    - Create `shared/src/types/content.ts` with PostType, DraftContent, AdaptedContent, PlatformConstraints interfaces
    - Create `shared/src/types/scheduling.ts` with ScheduledPost, ScheduleResult interfaces
    - Create `shared/src/types/analytics.ts` with EngagementMetrics, AggregateMetrics interfaces
    - Create `shared/src/types/agent.ts` with WorkflowRequest, WorkflowResult, ExecutionStep interfaces
    - Create `shared/src/types/integrations.ts` with VapiIntegration, ApifyIntegration interfaces
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 9.1, 9.2_

  - [ ] 1.3 Create Pulumi IaC project for cloud infrastructure
    - Initialize Pulumi project in `infra/` with TypeScript
    - Define PostgreSQL RDS instance with encryption at rest
    - Define Redis ElastiCache cluster
    - Define S3 bucket for media storage with public access blocked
    - Define SQS queues for publish scheduling and dead-letter queue
    - Define IAM roles with least-privilege policies for each service
    - Define API Gateway (REST + WebSocket) resources
    - Define Lambda functions or ECS services for backend
    - _Requirements: 8.3_

- [ ] 2. Implement data layer
  - [ ] 2.1 Create PostgreSQL database schema and migration setup
    - Set up database migration tool (e.g., node-pg-migrate or Prisma)
    - Create migration for `users` table with id, email, name, timestamps
    - Create migration for `platform_connections` table with encrypted token storage
    - Create migration for `post_types` table with target platforms array and formatting preferences JSONB
    - Create migration for `posts` table with status enum and scheduling fields
    - Create migration for `adapted_content` table linked to posts
    - Create migration for `publish_attempts` table with retry tracking
    - Create migration for `post_metrics` table for analytics
    - Create migration for `workflow_logs` table with JSONB steps
    - _Requirements: 1.1, 2.1, 5.1, 7.1_

  - [ ] 2.2 Implement database access layer (repositories)
    - Create `UserRepository` with CRUD operations
    - Create `PlatformConnectionRepository` with token management methods
    - Create `PostTypeRepository` with default seeding and custom type CRUD
    - Create `PostRepository` with status transitions and scheduling queries
    - Create `PublishAttemptRepository` with retry count tracking
    - Create `PostMetricsRepository` with aggregation queries
    - Create `WorkflowLogRepository` with step append operations
    - _Requirements: 1.1, 2.1, 2.4, 5.1, 7.1, 4.4_

  - [ ] 2.3 Implement Redis cache layer
    - Create `CacheService` with get/set/invalidate operations
    - Implement model response caching with TTL configuration
    - Implement platform token caching for quick access
    - Implement request deduplication for identical inference calls
    - _Requirements: 8.4_

  - [ ]* 2.4 Write property test for cache hit on repeated identical requests
    - **Property 9: Cache hit on repeated identical requests**
    - Generate random inference request objects, execute through cache service twice
    - Assert second call returns cached result without invoking the underlying provider
    - **Validates: Requirements 8.4**

  - [ ] 2.5 Implement S3 media storage service
    - Create `MediaStorageService` with upload, download, delete, and presigned URL generation
    - Support image and video format validation
    - Implement file size limits per platform requirements
    - _Requirements: 6.3, 6.4_

- [ ] 3. Checkpoint - Data layer verification
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement platform connectors
  - [ ] 4.1 Create base platform connector abstract class and factory
    - Implement `BasePlatformConnector` with shared OAuth token management logic
    - Create `PlatformConnectorFactory` for instantiating platform-specific connectors
    - Implement token refresh logic with expiry checking
    - _Requirements: 1.1, 1.4_

  - [ ]* 4.2 Write property test for token refresh before publish
    - **Property 1: Token refresh before publish**
    - Generate random platform connections with expired/valid tokens
    - Assert that expired tokens always trigger refresh before any publish operation
    - **Validates: Requirements 1.4**

  - [ ] 4.3 Implement X (Twitter) platform connector
    - Implement OAuth 2.0 authentication flow for X API v2
    - Implement `publish()` with 280-character enforcement
    - Implement `getMetrics()` for engagement data retrieval
    - Implement `validateConnection()` health check
    - _Requirements: 1.1, 1.5, 6.1_

  - [ ] 4.4 Implement LinkedIn platform connector
    - Implement OAuth 2.0 authentication flow for LinkedIn API
    - Implement `publish()` with professional formatting and 3000-character limit
    - Implement `getMetrics()` for engagement data retrieval
    - _Requirements: 1.1, 1.5, 6.2_

  - [ ] 4.5 Implement Facebook platform connector
    - Implement OAuth authentication flow for Facebook Graph API
    - Implement `publish()` with 63,206-character limit
    - Implement `getMetrics()` for engagement data retrieval
    - _Requirements: 1.1, 1.5, 6.7_

  - [ ] 4.6 Implement Instagram platform connector
    - Implement OAuth authentication flow for Instagram Graph API
    - Implement `publish()` with media validation and hashtag separation
    - Implement `getMetrics()` for engagement data retrieval
    - _Requirements: 1.1, 1.5, 6.3_

  - [ ] 4.7 Implement Threads platform connector
    - Implement authentication flow for Threads API
    - Implement `publish()` with 500-character limit enforcement
    - Implement `getMetrics()` for engagement data retrieval
    - _Requirements: 1.1, 1.5, 6.6_

  - [ ] 4.8 Implement TikTok platform connector
    - Implement OAuth authentication flow for TikTok API
    - Implement `publish()` with short caption and video format validation
    - Implement `getMetrics()` for engagement data retrieval
    - _Requirements: 1.1, 1.5, 6.4_

  - [ ] 4.9 Implement Bluesky platform connector
    - Implement AT Protocol authentication for Bluesky
    - Implement `publish()` with 300-character limit and embedded card link formatting
    - Implement `getMetrics()` for engagement data retrieval
    - _Requirements: 1.1, 1.5, 6.5_

- [ ] 5. Implement platform router and content adapter
  - [ ] 5.1 Implement Platform Router
    - Create `PlatformRouter` class implementing the routing interface
    - Load post type configurations from PostTypeRepository
    - Route content exclusively to platforms configured for the selected post type
    - Seed default post types: "business forward" (LinkedIn, X), "personal" (X, Instagram, Bluesky, Facebook, TikTok)
    - _Requirements: 2.1, 2.3_

  - [ ]* 5.2 Write property test for routing exclusivity
    - **Property 2: Routing exclusivity**
    - Generate random post types with random platform subsets and random content
    - Assert router output matches configured platforms exactly — no more, no fewer
    - **Validates: Requirements 2.3**

  - [ ] 5.3 Implement Content Adapter with platform-specific rules
    - Create `ContentAdapter` class with platform constraint definitions
    - Implement character limit enforcement for each platform (X: 280, LinkedIn: 3000, Bluesky: 300, Threads: 500, Facebook: 63,206)
    - Implement Instagram hashtag separation (extract hashtags from body into separate field)
    - Implement Bluesky link embedding (convert raw URLs to embedded card references)
    - Implement TikTok caption optimization for discoverability
    - Implement validation that produces warnings for near-limit content
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 5.4 Write property test for platform character limit enforcement
    - **Property 3: Platform character limit enforcement**
    - Generate random strings (0 to 100,000 chars) and all platform targets
    - Assert adapted output text length ≤ platform's defined character limit for every platform
    - **Validates: Requirements 3.2, 6.1, 6.2, 6.5, 6.6, 6.7**

  - [ ]* 5.5 Write property test for Instagram hashtag separation
    - **Property 4: Instagram hashtag separation**
    - Generate random content strings containing embedded #hashtags
    - Assert no hashtag patterns remain in the caption field and all hashtags appear in the separate array
    - **Validates: Requirements 6.3**

  - [ ]* 5.6 Write property test for Bluesky link embedding
    - **Property 5: Bluesky link embedding**
    - Generate random content strings containing embedded URLs
    - Assert no raw URLs remain in output text and all links are in embedded cards structure
    - **Validates: Requirements 6.5**

- [ ] 6. Checkpoint - Platform layer verification
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement Content Agent and model provider integration
  - [ ] 7.1 Implement Cerebras AI model provider client
    - Create `CerebrasProvider` implementing a common `ModelProvider` interface
    - Implement OpenAI-compatible API calls for chat completions
    - Implement response caching through CacheService
    - Handle rate limiting and error responses
    - _Requirements: 8.2, 8.4_

  - [ ] 7.2 Implement Amazon Bedrock model provider client
    - Create `BedrockProvider` implementing the common `ModelProvider` interface
    - Implement invoke model calls for content generation
    - Implement response caching through CacheService
    - Handle throttling and service unavailability
    - _Requirements: 8.1, 8.4_

  - [ ] 7.3 Implement model provider fallback logic
    - Create `ModelProviderRouter` that wraps both providers
    - Implement primary/fallback routing: try preferred provider first, fall back on failure
    - Implement health checking for provider availability
    - _Requirements: 8.5_

  - [ ]* 7.4 Write property test for model provider fallback
    - **Property 10: Model provider fallback**
    - Generate random inference requests with simulated primary provider failures
    - Assert alternative provider is called and no immediate failure is returned to user
    - **Validates: Requirements 8.5**

  - [ ] 7.5 Implement Content Agent
    - Create `ContentAgent` class using ModelProviderRouter for inference
    - Implement `generate()` method that creates content matching post type tone and style
    - Implement `suggestFromHistory()` that uses historical engagement data for recommendations
    - Integrate with Content Adapter for platform-specific output
    - _Requirements: 3.1, 3.2, 3.3, 7.4_

- [ ] 8. Implement Agent Orchestrator with Bedrock AgentCore
  - [ ] 8.1 Implement Agent Orchestrator core
    - Create `AgentOrchestrator` class integrating with Bedrock AgentCore Runtime
    - Implement workflow plan decomposition (break complex requests into sub-tasks)
    - Implement tool invocation dispatch (content generation, scheduling, platform APIs)
    - Implement reflection loop: on sub-task failure, attempt alternative approach before reporting
    - Implement execution logging with step-by-step audit trail
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 8.2 Write property test for orchestrator retry before failure report
    - **Property 6: Orchestrator retry before failure report**
    - Generate random workflow plans with random failure injection on sub-tasks
    - Assert at least one alternative approach is attempted before user failure notification
    - **Validates: Requirements 4.3**

  - [ ] 8.3 Implement workflow result presentation
    - Create workflow summary formatter for dashboard display
    - Implement `getExecutionLog()` for detailed step inspection
    - Format agent actions and results for user transparency
    - _Requirements: 4.4, 4.5_

- [ ] 9. Implement Scheduler and Publisher
  - [ ] 9.1 Implement Scheduler service
    - Create `SchedulerService` with schedule, cancel, and reschedule operations
    - Implement SQS message enqueue at specified datetime
    - Implement calendar query for upcoming posts
    - Validate that scheduled times are in the future
    - _Requirements: 5.1, 5.2, 5.5_

  - [ ]* 9.2 Write property test for scheduler queues at specified time
    - **Property 7: Scheduler queues at specified time**
    - Generate random future datetimes and random post content
    - Assert resulting queue entry has publication timestamp equal to user-specified datetime
    - **Validates: Requirements 5.1**

  - [ ] 9.3 Implement Publisher service (SQS consumer)
    - Create `PublisherService` that processes SQS messages
    - Implement multi-platform publish dispatch via PlatformConnectorFactory
    - Implement retry logic with exponential backoff (max 3 retries per platform)
    - Implement dead-letter queue routing after retry exhaustion
    - Implement user notification on publish failure after retries
    - Handle partial publish (some platforms succeed, some fail)
    - _Requirements: 5.2, 5.3, 5.4_

  - [ ]* 9.4 Write property test for publish retry bounded at 3
    - **Property 8: Publish retry bounded at 3**
    - Generate random publish failures (1-10 consecutive) for various platforms
    - Assert retry count ≤ 3 and user notification is produced after 3rd failure
    - **Validates: Requirements 5.4**

- [ ] 10. Implement Analytics Collector
  - [ ] 10.1 Implement Analytics Collector service
    - Create `AnalyticsCollectorService` that periodically polls platform metrics
    - Implement per-platform metric retrieval using platform connectors' `getMetrics()`
    - Implement metric aggregation across platforms (total likes, shares, comments, impressions)
    - Implement per-post platform breakdown queries
    - Store metrics in PostMetricsRepository
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 11. Checkpoint - Core services verification
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement external integrations
  - [ ] 12.1 Implement Vapi voice input integration
    - Create `VapiService` implementing VapiIntegration interface
    - Implement `transcribeVoiceInput()` for audio-to-text conversion
    - Implement `isConfigured()` check for graceful degradation
    - Wire voice transcription output into Content Agent prompt
    - _Requirements: 9.1, 9.3_

  - [ ] 12.2 Implement Apify trend research integration
    - Create `ApifyService` implementing ApifyIntegration interface
    - Implement `researchTrends()` for trending topic discovery
    - Implement `scrapeCompetitorContent()` for competitive analysis
    - Implement `isConfigured()` check for graceful degradation
    - Wire trend data into Content Agent context
    - _Requirements: 9.2, 9.3_

  - [ ]* 12.3 Write property test for graceful degradation on external tool failure
    - **Property 11: Graceful degradation on external tool failure**
    - Generate random workflows with Vapi/Apify availability toggled off
    - Assert system continues operating without failed tool and notification is produced
    - **Validates: Requirements 9.3**

- [ ] 13. Implement React dashboard frontend
  - [ ] 13.1 Initialize React project with routing and state management
    - Set up React app in `frontend/` with Vite, React Router, and state management (Zustand or Redux Toolkit)
    - Configure TailwindCSS or component library for responsive design
    - Set up API client layer for REST and WebSocket connections
    - Implement authentication flow (login/session management)
    - _Requirements: 10.1, 10.3_

  - [ ] 13.2 Implement platform connection management UI
    - Create platform connection page showing all 7 platforms with status indicators
    - Implement OAuth flow initiation buttons for each platform
    - Display connected/expired/disconnected status per platform
    - Show external integration status (Vapi, Apify) with connection indicators
    - _Requirements: 1.2, 1.3, 1.5, 9.4_

  - [ ] 13.3 Implement compose view with AI content generation
    - Create unified compose view with text editor, post type selector, and platform preview
    - Implement AI content generation trigger with loading states
    - Display platform-specific content previews showing adapted versions
    - Implement draft editing before publish/schedule
    - Support voice input button (when Vapi configured)
    - _Requirements: 3.4, 10.1_

  - [ ] 13.4 Implement scheduling and calendar view
    - Create calendar view showing scheduled and published posts
    - Implement date/time picker for scheduling posts
    - Implement immediate publish button
    - Display post status indicators (draft, scheduled, published, failed)
    - Implement cancel and reschedule actions
    - _Requirements: 5.1, 5.5, 10.2_

  - [ ] 13.5 Implement analytics dashboard view
    - Create aggregate metrics overview (total likes, shares, comments, impressions)
    - Implement per-post engagement breakdown with platform-specific metrics
    - Create chart visualizations for engagement trends over time
    - _Requirements: 7.2, 7.3_

  - [ ] 13.6 Implement real-time status updates via WebSocket
    - Create WebSocket connection manager with auto-reconnect and exponential backoff
    - Implement real-time publish status updates (publishing, published, failed)
    - Implement real-time workflow progress updates during agent execution
    - Fall back to polling when WebSocket connection fails
    - _Requirements: 10.4_

  - [ ] 13.7 Implement post type management UI
    - Create post type list view with default and custom types
    - Implement create/edit form for custom post types (platform selection, tone, formatting)
    - Implement delete confirmation for custom post types
    - _Requirements: 2.1, 2.2, 2.4_

  - [ ] 13.8 Implement agent workflow transparency view
    - Create workflow execution log viewer showing planning, tool use, and reflection steps
    - Display workflow summary on completion
    - Show step-by-step progress during execution
    - _Requirements: 4.4, 4.5_

- [ ] 14. Checkpoint - Frontend verification
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Integration wiring and end-to-end tests
  - [ ] 15.1 Wire API Gateway routes to backend services
    - Create Express/Fastify REST API with routes for: auth, posts, post-types, schedule, analytics, workflows
    - Implement WebSocket upgrade handling for real-time updates
    - Wire API middleware: authentication, validation, error handling
    - Connect all service classes to API route handlers
    - _Requirements: 10.1, 10.4_

  - [ ]* 15.2 Write integration tests for platform OAuth flows
    - Mock OAuth servers for each platform
    - Test full auth cycle: initiate → callback → token storage → refresh
    - _Requirements: 1.1, 1.4_

  - [ ]* 15.3 Write integration tests for publish pipeline
    - Test end-to-end publish from SQS enqueue to mock platform API calls
    - Test partial publish scenarios (some succeed, some fail)
    - Test retry exhaustion and dead-letter queue routing
    - _Requirements: 5.2, 5.3, 5.4_

  - [ ]* 15.4 Write integration tests for model provider calls
    - Mock Bedrock and Cerebras endpoints
    - Test request/response handling, caching, and fallback behavior
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

  - [ ]* 15.5 Write integration tests for external tool integrations
    - Mock Vapi transcription API and verify audio-to-text pipeline
    - Mock Apify actor API and verify trend data retrieval
    - Test graceful degradation when services are unavailable
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 15.6 Write end-to-end test for compose → schedule → publish → analytics flow
    - Test full lifecycle with mock external services
    - Verify post status transitions: draft → scheduled → publishing → published
    - Verify analytics collection after publish
    - _Requirements: 3.1, 5.1, 5.2, 7.1_

  - [ ]* 15.7 Write end-to-end test for multi-platform simultaneous publish
    - Test publishing to all 7 platforms simultaneously with mixed success/failure
    - Verify partial publish handling and retry behavior
    - _Requirements: 5.2, 5.4_

  - [ ]* 15.8 Write end-to-end test for agent workflow execution
    - Test "create a week of posts" workflow decomposition and execution
    - Verify plan creation, tool use, and result summary
    - _Requirements: 4.1, 4.2, 4.5_

- [ ] 16. Final checkpoint - Full system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases
- All infrastructure is defined as Pulumi TypeScript IaC in the `infra/` package
- The backend uses TypeScript/Node.js aligned with the Pulumi language choice
- External APIs (platforms, Vapi, Apify, model providers) should be mocked in tests using dependency injection

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "2.3", "2.5"] },
    { "id": 3, "tasks": ["2.2", "2.4"] },
    { "id": 4, "tasks": ["4.1", "5.1"] },
    { "id": 5, "tasks": ["4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8", "4.9", "5.2"] },
    { "id": 6, "tasks": ["5.3"] },
    { "id": 7, "tasks": ["5.4", "5.5", "5.6"] },
    { "id": 8, "tasks": ["7.1", "7.2"] },
    { "id": 9, "tasks": ["7.3", "7.5"] },
    { "id": 10, "tasks": ["7.4", "8.1"] },
    { "id": 11, "tasks": ["8.2", "8.3"] },
    { "id": 12, "tasks": ["9.1"] },
    { "id": 13, "tasks": ["9.2", "9.3"] },
    { "id": 14, "tasks": ["9.4", "10.1"] },
    { "id": 15, "tasks": ["12.1", "12.2"] },
    { "id": 16, "tasks": ["12.3"] },
    { "id": 17, "tasks": ["13.1"] },
    { "id": 18, "tasks": ["13.2", "13.3", "13.4", "13.5", "13.6", "13.7", "13.8"] },
    { "id": 19, "tasks": ["15.1"] },
    { "id": 20, "tasks": ["15.2", "15.3", "15.4", "15.5", "15.6", "15.7", "15.8"] }
  ]
}
```
