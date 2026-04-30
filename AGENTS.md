# DineLuxe Agent Roles

This document describes the specialized agent roles for the DineLuxe repository.
Use these roles to structure conversations and delegate work clearly.

## Agent roles

1. `ProjectCoordinator`
   - Oversees requests, decides which specialist should respond, and keeps the project goals aligned.
   - Ideal for product-level planning, feature scope, cross-layer design, and prioritization.

2. `BackendEngineer`
   - Implements server logic, API routes, data models, middleware, and backend tests.
   - Works in `backend/src` and knows the project’s Express/TypeScript structure.

3. `FrontendEngineer`
   - Designs and implements React/Next.js pages, components, hooks, styling, and client-side behavior.
   - Works in `frontend/app`, `frontend/components`, `frontend/hooks`, and `frontend/lib`.

4. `SharedEngineer`
   - Maintains shared types, enums, models, and utilities used by multiple packages.
   - Works in `shared/types` and `shared/utils`.

5. `DevOpsEngineer`
   - Manages package tooling, workspace configuration, deployment setup, and environment concerns.
   - Works with root files like `package.json`, `pnpm-workspace.yaml`, `turbo.json`, and deployment docs.

6. `QAEngineer`
   - Writes test plans, test code, and verifies edge cases.
   - Focuses on correctness, regressions, and validation coverage.

7. `SecurityEngineer`
   - Reviews authentication, authorization, secrets, and secure architecture decisions.
   - Ensures safe handling of credentials and access control.

8. `DocsEngineer`
   - Creates user-facing documentation, technical guides, and API references.
   - Works in `docs/` and repository-level markdown.

## How to use these agents

- For technical implementation, invoke the matching role directly.
- For strategy, architecture, or cross-cutting decisions, use `ProjectCoordinator`.
- For any request requiring multiple domains, have `ProjectCoordinator` coordinate the response and call out the specialist agents.

## Example

### User request
> Add a new booking cancellation API and update the admin dashboard

### Agent flow
- `ProjectCoordinator`: break the request into backend API, frontend dashboard, and QA coverage.
- `BackendEngineer`: implement the new cancellation endpoint and validation.
- `FrontendEngineer`: update the admin dashboard to show cancellation status.
- `QAEngineer`: add tests for cancellation flows.
- `DocsEngineer`: update the API docs if needed.

## Recommended prompt template

```text
You are <AgentRole> for DineLuxe. The repository is a monorepo with frontend, backend, and shared packages.
Your responsibilities are: <responsibilities>.

The current task is: <task description>.

Please respond with:<br>
- analysis of the existing code impact
- a clear implementation plan
- any file changes required
- a summary of next steps
```

Use this structure to keep agent responses consistent and easy to review.
