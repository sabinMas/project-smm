# Implementation Plan: Social Media Manager

## Overview

This plan implements a full-stack TypeScript Social Media Manager application with a React frontend and Node.js/Express backend. The implementation proceeds from foundational interfaces and infrastructure, through platform connectors and AI agent integration, to scheduling, analytics, and UI assembly. Each task builds incrementally on previous work so there is no orphaned code.

## Tasks

- [ ] 1. Set up project structure, shared types, and core interfaces
  - [ ] 1.1 Initialize monorepo with frontend and backend packages
    - Create directory structure: `packages/frontend` (React + Vite), `packages/backend` (Node.js + Express), `packages/shared` (shared types)
    - Configure TypeScript `tsconfig.json` for each package with project references
    - Set up package.json scripts for dev, build, and test
    - Install core dependencies: express, react, react-dom, vite, vitest, prisma
    - _Requirements: 8.3, 10.1_

  - [ ] 1.2 Define shared type definitions and interfaces
    - Create `packages/shared/src/types/platform.ts` with `PlatformType`, `PlatformContent`, `PublishResult`, `EngagementMetrics`
    - Create `packages/shared/src/types/content.ts` with `ContentPrompt`, `ContentDraft`, `AdaptedContent`, `PostType`, `FormattingPrefs`
    - Create `packages/shared/src/types/workflow.ts` with `WorkflowRequest`, `WorkflowPlan`, `PlanStep`, `WorkflowLogEntry`
    - Create `packages/shared/src/types/scheduler.ts` with `ScheduledPost`, `ScheduleResult`, `DateRange`
    - Create `packages/shared/src/types/auth.ts` with `OAuthCredentials`, `ApiKeyCredentials`, `AuthResult`, `TokenData`
    - Create `packages/shared/src/types/model.ts` with `ModelProviderType`, `CompletionRequest`, `CompletionResponse`, `ModelProviderConfig`
    - Create `packages/shared/src/types/external.ts` with `VapiTranscription`, `ApifyTrendResult`, `TrendQuery`
    - Export all types from `packages/shared/src/index.ts`
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1_

  - [ ] 1.3 Set up database schema with Prisma
    - Create `packages/backend/prisma/schema.prisma` with User, PlatformConnection, PostType, Post, PlatformPost, EngagementSnapshot, and WorkflowLog models per design ERD
    - Configure Prisma client generation and database connection (SQLite for dev, PostgreSQL for prod)
    - Generate initial migration
    - _Requirements: 1.1, 5.1, 7.1_

  - [ ]* 1.4 Write unit tests for shared type validation helpers
    - Test platform constraints lookups
    - Test PostType default configuration
    - _Requirements: 2.1, 6.1_

- [ ] 2. Implement platform connector layer
  - [ ] 2.1 Create PlatformConnector base interface and factory
    - Create `packages/backend/src/platform/connector.interface.ts` implementing the `PlatformConnector` interface from design
    - Create `packages/backend/src/platform/connector.factory.ts` with factory function that instantiates connectors by platform type
    - Define platform constraints configuration constant `PLATFORM_CONSTRAINTS`
    - _Requirements: 1.1, 1.5, 6.1_

  - [ ] 2.2 Implement X (Twitter) connector
    - Create `packages/backend/src/platform/connectors/x.connector.ts`
    - Implement OAuth 2.0 authentication, token refresh, publish, getEngagement, and validateContent
    - Enforce 280-character limit in validateContent
    - _Requirements: 1.1, 1.4, 6.1_

  - [ ] 2.3 Implement LinkedIn connector
    - Create `packages/backend/src/platform/connectors/linkedin.connector.ts`
    - Implement OAuth authentication, publish with professional formatting, getEngagement
    - Enforce 3000-character limit
    - _Requirements: 1.1, 1.4, 6.2_

  - [ ] 2.4 Implement Facebook connector
    - Create `packages/backend/src/platform/connectors/facebook.connector.ts`
    - Implement OAuth authentication, publish, getEngagement
    - Enforce 63,206-character limit
    - _Requirements: 1.1, 1.4, 6.7_

  - [ ] 2.5 Implement Instagram connector
    - Create `packages/backend/src/platform/connectors/instagram.connector.ts`
    - Implement OAuth authentication, publish with media validation, getEngagement
    - Enforce 2200-character limit and media requirement
    - _Requirements: 1.1, 1.4, 6.3_

  - [ ] 2.6 Implement Threads connector
    - Create `packages/backend/src/platform/connectors/threads.connector.ts`
    - Implement authentication, publish, getEngagement
    - Enforce 500-character limit
    - _Requirements: 1.1, 1.4, 6.6_

  - [ ] 2.7 Implement TikTok connector
    - Create `packages/backend/src/platform/connectors/tiktok.connector.ts`
    - Implement authentication, publish with video format validation, getEngagement
    - Enforce 4000-character limit and media requirement
    - _Requirements: 1.1, 1.4, 6.4_

  - [ ] 2.8 Implement Bluesky connector
    - Create `packages/backend/src/platform/connectors/bluesky.connector.ts`
    - Implement API-key/app-password authentication, publish with embedded card link format, getEngagement
    - Enforce 300-character limit
    - _Requirements: 1.1, 1.4, 6.5_

  - [ ] 2.9 Implement PlatformRouter
    - Create `packages/backend/src/platform/router.ts` implementing `PlatformRouter` interface
    - Route content to platforms based on PostType configuration
    - Provide default post types: "business forward" (LinkedIn, X) and "personal" (X, Instagram, Bluesky, Facebook, TikTok)
    - _Requirements: 2.1, 2.3_

  - [ ]* 2.10 Write unit tests for platform connectors and router
    - Test validateContent for each platform's character limits
    - Test PlatformRouter routing logic for default and custom post types
    - Test connector factory instantiation
    - _Requirements: 1.5, 2.1, 2.3, 6.1–6.7_

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement model provider and AI agent layer
  - [ ] 4.1 Implement ModelProvider interface with Bedrock and Cerebras providers
    - Create `packages/backend/src/ai/provider.interface.ts` implementing `ModelProvider` interface
    - Create `packages/backend/src/ai/providers/bedrock.provider.ts` with AWS SDK integration
    - Create `packages/backend/src/ai/providers/cerebras.provider.ts` with Cerebras API integration
    - Implement response caching with configurable TTL
    - Implement automatic fallback: if primary provider fails, use fallback provider
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

  - [ ] 4.2 Implement ContentAgent
    - Create `packages/backend/src/ai/agents/content.agent.ts` implementing `ContentAgent` interface
    - Implement `generate` method: build prompt from ContentPrompt, call ModelProvider, return ContentDraft
    - Implement `refine` method: take draft + user feedback, produce refined draft
    - Implement `suggestFromHistory` method: use engagement data to generate content suggestions
    - Prefer free-tier model access per DEFAULT_MODEL_CONFIG
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 7.4_

  - [ ] 4.3 Implement ContentAdapter
    - Create `packages/backend/src/ai/agents/content.adapter.ts` implementing `ContentAdapter` interface
    - Implement `adapt` method: transform content per platform constraints (character limits, hashtag behavior, link format)
    - Implement `validateConstraints` method: check adapted content against PLATFORM_CONSTRAINTS
    - Handle platform-specific formatting: X hashtag optimization, LinkedIn professional tone, Instagram hashtag separation, Bluesky embedded cards
    - _Requirements: 3.2, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ] 4.4 Implement AgentOrchestrator
    - Create `packages/backend/src/ai/orchestrator.ts` implementing `AgentOrchestrator` interface
    - Implement plan-execute-reflect cycle: decompose WorkflowRequest into PlanSteps, execute sequentially, reflect on failures
    - Wire ContentAgent, ContentAdapter, PlatformRouter, and Scheduler as available tools
    - Log each planning step, tool invocation, and reflection as WorkflowLogEntry
    - Implement retry logic: on sub-task failure, reflect and attempt alternative approach before reporting failure
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 4.5 Write unit tests for AI agent layer
    - Test ModelProvider fallback behavior
    - Test ContentAgent generation with mocked providers
    - Test ContentAdapter platform-specific adaptations
    - Test AgentOrchestrator plan decomposition and reflection
    - _Requirements: 3.1, 3.5, 4.1, 4.3, 8.5_

- [ ] 5. Implement external tool integrations
  - [ ] 5.1 Implement Vapi voice integration
    - Create `packages/backend/src/integrations/vapi.integration.ts` implementing `VapiIntegration` interface
    - Implement `isConfigured` check (env variable presence)
    - Implement `transcribeVoiceInput` method
    - Gracefully degrade if Vapi is not configured
    - _Requirements: 9.1, 9.3_

  - [ ] 5.2 Implement Apify scraping integration
    - Create `packages/backend/src/integrations/apify.integration.ts` implementing `ApifyIntegration` interface
    - Implement `isConfigured` check
    - Implement `fetchTrends` and `scrapeCompetitorContent` methods
    - Gracefully degrade if Apify is not configured
    - _Requirements: 9.2, 9.3_

  - [ ]* 5.3 Write unit tests for external integrations
    - Test graceful degradation when tools are not configured
    - Test error handling when API calls fail
    - _Requirements: 9.3_

- [ ] 6. Implement scheduling and publishing system
  - [ ] 6.1 Implement Scheduler with job queue
    - Create `packages/backend/src/scheduler/scheduler.ts` implementing `Scheduler` interface
    - Implement persistent job queue with cron-based triggers (use node-cron or similar)
    - Implement `schedulePost`: store ScheduledPost in database, enqueue job
    - Implement `cancelScheduled`: remove from queue, update status
    - Implement `getScheduledPosts`: query by date range
    - Implement `retryFailed`: re-enqueue with incremented retryCount (max 3 retries)
    - _Requirements: 5.1, 5.2, 5.4_

  - [ ] 6.2 Implement publish execution logic
    - Create `packages/backend/src/scheduler/publisher.ts`
    - On job trigger: iterate target platforms, call respective PlatformConnector.publish
    - Handle partial failures: update per-platform status, mark post as "partially-failed" if some succeed
    - Implement immediate publish path (within 30 seconds)
    - Notify user on complete failure after retries
    - _Requirements: 5.2, 5.3, 5.4_

  - [ ]* 6.3 Write unit tests for scheduler
    - Test scheduling, cancellation, and retry logic
    - Test partial failure handling
    - _Requirements: 5.1, 5.4_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement backend API controllers
  - [ ] 8.1 Implement Auth controller
    - Create `packages/backend/src/controllers/auth.controller.ts`
    - Endpoints: `POST /auth/connect/:platform` (initiate OAuth), `GET /auth/callback/:platform` (handle OAuth callback), `GET /auth/status` (list connected platforms)
    - Wire to PlatformConnector.authenticate and store credentials in PlatformConnection table
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 8.2 Implement Content controller
    - Create `packages/backend/src/controllers/content.controller.ts`
    - Endpoints: `POST /content/generate` (trigger AI generation), `POST /content/adapt` (get platform variations), `PUT /content/:id/refine` (refine draft with feedback), `POST /content/publish` (immediate publish)
    - Wire to AgentOrchestrator for complex workflows, ContentAgent for simple generation
    - _Requirements: 3.1, 3.2, 3.4, 4.1, 5.3_

  - [ ] 8.3 Implement Schedule controller
    - Create `packages/backend/src/controllers/schedule.controller.ts`
    - Endpoints: `POST /schedule` (schedule post), `DELETE /schedule/:id` (cancel), `GET /schedule` (list by date range), `POST /schedule/:id/retry` (retry failed)
    - Wire to Scheduler
    - _Requirements: 5.1, 5.2, 5.4, 5.5_

  - [ ] 8.4 Implement Analytics controller
    - Create `packages/backend/src/controllers/analytics.controller.ts`
    - Endpoints: `GET /analytics/overview` (aggregate metrics), `GET /analytics/post/:id` (per-platform breakdown)
    - Wire to EngagementSnapshot queries
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 8.5 Implement PostType controller
    - Create `packages/backend/src/controllers/posttype.controller.ts`
    - Endpoints: `GET /post-types` (list), `POST /post-types` (create), `PUT /post-types/:id` (edit), `DELETE /post-types/:id` (delete)
    - Seed default post types on first run
    - _Requirements: 2.1, 2.2, 2.4_

  - [ ] 8.6 Wire Express app with all controllers and middleware
    - Create `packages/backend/src/app.ts` with Express setup, JSON parsing, CORS, error handling middleware
    - Create `packages/backend/src/server.ts` entry point
    - Register all route controllers
    - _Requirements: 10.4_

  - [ ]* 8.7 Write integration tests for API endpoints
    - Test auth flow with mocked OAuth providers
    - Test content generation and publish endpoints
    - Test schedule CRUD operations
    - _Requirements: 1.1, 3.1, 5.1_

- [ ] 9. Implement analytics collector background service
  - [ ] 9.1 Implement AnalyticsCollector
    - Create `packages/backend/src/analytics/collector.ts`
    - Implement periodic polling: for each published PlatformPost, call PlatformConnector.getEngagement
    - Store results as EngagementSnapshot records
    - Run on configurable interval (default: every 6 hours)
    - _Requirements: 7.1, 7.2_

  - [ ]* 9.2 Write unit tests for analytics collector
    - Test metric aggregation logic
    - Test polling interval behavior
    - _Requirements: 7.1_

- [ ] 10. Implement frontend dashboard
  - [ ] 10.1 Set up React app with routing and layout
    - Configure `packages/frontend` with Vite, React Router, and base layout
    - Create layout shell with navigation sidebar (Dashboard, Compose, Calendar, Analytics, Settings)
    - Set up API client utility for backend communication
    - Implement responsive layout for mobile (320px+)
    - _Requirements: 10.1, 10.3_

  - [ ] 10.2 Implement Compose view
    - Create compose form with text editor, post type selector, and platform preview
    - Integrate with `POST /content/generate` for AI-assisted drafting
    - Show platform-specific previews with character count indicators
    - Add publish now / schedule options
    - _Requirements: 3.4, 10.1_

  - [ ] 10.3 Implement Calendar view
    - Create calendar component displaying scheduled and published posts
    - Allow date-range navigation and post status filtering
    - Wire to `GET /schedule` endpoint
    - _Requirements: 5.5_

  - [ ] 10.4 Implement Analytics view
    - Create aggregate metrics dashboard (total likes, shares, comments, impressions)
    - Create per-post engagement breakdown view
    - Wire to `GET /analytics/overview` and `GET /analytics/post/:id`
    - _Requirements: 7.2, 7.3_

  - [ ] 10.5 Implement Platform Connections settings view
    - Create settings page showing all seven platforms with connection status
    - Implement connect/disconnect buttons triggering auth flow
    - Display active/inactive external integrations (Vapi, Apify)
    - _Requirements: 1.2, 1.5, 9.4_

  - [ ] 10.6 Implement real-time status updates
    - Set up WebSocket or Server-Sent Events connection for publish status
    - Update post status indicators in feed without page refresh
    - Show workflow progress for agentic operations
    - _Requirements: 4.5, 10.2, 10.4_

  - [ ] 10.7 Implement content feed view
    - Create feed showing recent and upcoming posts with status indicators (draft, scheduled, published, failed)
    - Support filtering by platform and post type
    - _Requirements: 10.2_

  - [ ]* 10.8 Write unit tests for frontend components
    - Test compose view form validation
    - Test calendar date navigation
    - Test responsive layout breakpoints
    - _Requirements: 10.1, 10.3_

- [ ] 11. Implement infrastructure as code
  - [ ] 11.1 Set up Pulumi infrastructure definitions
    - Create `packages/infrastructure` with Pulumi TypeScript project
    - Define cloud resources: database, compute, storage, environment variables
    - Configure model provider access (Bedrock IAM, Cerebras API keys)
    - _Requirements: 8.3_

- [ ] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Unit tests validate specific examples and edge cases
- The design uses TypeScript end-to-end so all implementation uses TypeScript
- No property-based tests are included as the design does not define correctness properties
- External integrations (Vapi, Apify) are optional and gracefully degradable

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4", "2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "2.9"] },
    { "id": 4, "tasks": ["2.10", "4.1"] },
    { "id": 5, "tasks": ["4.2", "4.3", "5.1", "5.2"] },
    { "id": 6, "tasks": ["4.4", "5.3"] },
    { "id": 7, "tasks": ["4.5", "6.1"] },
    { "id": 8, "tasks": ["6.2", "6.3", "9.1"] },
    { "id": 9, "tasks": ["8.1", "8.2", "8.3", "8.4", "8.5", "9.2"] },
    { "id": 10, "tasks": ["8.6", "8.7"] },
    { "id": 11, "tasks": ["10.1", "11.1"] },
    { "id": 12, "tasks": ["10.2", "10.3", "10.4", "10.5", "10.6", "10.7"] },
    { "id": 13, "tasks": ["10.8"] }
  ]
}
```
