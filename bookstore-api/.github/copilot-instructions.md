# Copilot Review Guide

Use these instructions when the user asks for a review, a Copilot review, or a local review in the IDE.

## Review Mode

- Treat review requests as code review tasks, not implementation tasks.
- Start from the current diff, staged changes, current branch, or the files the user names.
- Prioritize findings over summaries.
- Focus on bugs, regressions, broken contracts, authorization gaps, validation issues, missing tests, and risky behavior changes.
- Keep the review local to the changed code path before expanding scope.

## Local Review Workflow In The IDE

When the user wants to run a Copilot review locally in the IDE, guide the review around the actual workspace state:

1. Inspect the changed files first.
2. Read the nearest implementation and the closest relevant tests.
3. Run the narrowest validation command that can confirm or falsify a concern.
4. Report findings with severity, impact, and exact file references.
5. If there are no findings, say so explicitly and mention what was or was not validated.

Useful prompts the user can give in the IDE:

- Review the current branch.
- Review my staged changes.
- Review the diff against main.
- Review this file for bugs and regressions.
- Review these changes and tell me what tests I should run.

## Project-Specific Validation

Choose the smallest relevant check for the files under review.

### Backend: Laravel API

Run from `bookstore-api/` when PHP, routes, middleware, models, migrations, controllers, or API behavior changes.

- `composer test`
- `php artisan test`
- `npm run build`

Reviewers should pay extra attention to:

- Sanctum authentication and protected routes
- Role and admin authorization
- Request validation and error responses
- Eloquent query correctness and pagination/filter behavior
- Migration safety and seed assumptions

### Frontend: React App

Run from `bookstore-frontend/` when React components, routing, hooks, forms, or API integration changes.

- `npm test`
- `npm run test:coverage`
- `npm run test:e2e`
- `npm run build`

Reviewers should pay extra attention to:

- Auth flows and protected routes
- Admin-only UI access
- Search, filtering, and collection flows
- API error handling and loading states
- Regressions between frontend requests and backend responses

### Full-Stack Changes

If a change touches both apps or changes an API contract, review both sides together.

- Verify request and response shapes still match.
- Verify auth state, token handling, and role-based behavior still align.
- Verify frontend tests and backend tests cover the same behavior.

## Findings Format

Present findings first, ordered by severity.

For each finding, include:

- A short title
- Why it is a bug, regression, or risk
- The affected file reference
- The condition that triggers it
- The smallest practical fix or follow-up check

If no actionable findings are found, say that explicitly and add any residual risk, untested path, or missing coverage.

## Review Boundaries

- Do not rewrite unrelated code during a review.
- Do not broaden into general refactoring unless the user asks.
- Prefer narrow validation over full test suites unless the change requires broader coverage.
- When commands cannot be run locally, state that clearly and continue with static review findings only.
