# Adapter Files

## Frontend Files

- /content/custom-paperclip/ui/src/adapters/transcript.test.ts
- /content/custom-paperclip/ui/src/adapters/transcript.ts
- /content/custom-paperclip/ui/src/adapters/schema-config-fields.tsx
- /content/custom-paperclip/ui/src/adapters/use-adapter-capabilities.ts
- /content/custom-paperclip/ui/src/adapters/use-disabled-adapters.ts
- /content/custom-paperclip/ui/src/adapters/types.ts
- /content/custom-paperclip/ui/src/adapters/sandboxed-parser-worker.ts
- /content/custom-paperclip/ui/src/adapters/sandboxed-parser-worker.test.ts
- /content/custom-paperclip/ui/src/adapters/registry.ts
- /content/custom-paperclip/ui/src/adapters/registry.test.ts
- /content/custom-paperclip/ui/src/adapters/runtime-json-fields.tsx
- /content/custom-paperclip/ui/src/adapters/dynamic-loader.ts
- /content/custom-paperclip/ui/src/adapters/disabled-store.ts
- /content/custom-paperclip/ui/src/adapters/metadata.ts
- /content/custom-paperclip/ui/src/adapters/metadata.test.ts
- /content/custom-paperclip/ui/src/adapters/adapter-display-registry.ts
- /content/custom-paperclip/ui/src/adapters/index.ts
- /content/custom-paperclip/ui/src/adapters/local-workspace-runtime-fields.tsx

## Adapter-specific Frontend Files

### Claude Local
- /content/custom-paperclip/ui/src/adapters/claude-local/config-fields.tsx
- /content/custom-paperclip/ui/src/adapters/claude-local/index.ts

### Codex Local
- /content/custom-paperclip/ui/src/adapters/codex-local/config-fields.tsx
- /content/custom-paperclip/ui/src/adapters/codex-local/index.ts

### Cursor
- /content/custom-paperclip/ui/src/adapters/cursor/config-fields.tsx
- /content/custom-paperclip/ui/src/adapters/cursor/index.ts

### Gemini Local
- /content/custom-paperclip/ui/src/adapters/gemini-local/config-fields.tsx
- /content/custom-paperclip/ui/src/adapters/gemini-local/index.ts

### Hermes Local
- /content/custom-paperclip/ui/src/adapters/hermes-local/config-fields.tsx
- /content/custom-paperclip/ui/src/adapters/hermes-local/index.ts

### HTTP
- /content/custom-paperclip/ui/src/adapters/http/parse-stdout.ts
- /content/custom-paperclip/ui/src/adapters/http/build-config.ts
- /content/custom-paperclip/ui/src/adapters/http/config-fields.tsx
- /content/custom-paperclip/ui/src/adapters/http/index.ts

### OpenCLAW Gateway
- /content/custom-paperclip/ui/src/adapters/openclaw-gateway/config-fields.tsx
- /content/custom-paperclip/ui/src/adapters/openclaw-gateway/index.ts

### OpenCode Local
- /content/custom-paperclip/ui/src/adapters/opencode-local/config-fields.tsx
- /content/custom-paperclip/ui/src/adapters/opencode-local/index.ts

### OpenCode Remote
- /content/custom-paperclip/ui/src/adapters/opencode-remote/config-fields.tsx
- /content/custom-paperclip/ui/src/adapters/opencode-remote/index.ts

### OpenRouter
- /content/custom-paperclip/ui/src/adapters/openrouter/config-fields.tsx
- /content/custom-paperclip/ui/src/adapters/openrouter/index.ts

### PI Local
- /content/custom-paperclip/ui/src/adapters/pi-local/config-fields.tsx
- /content/custom-paperclip/ui/src/adapters/pi-local/index.ts

### Process
- /content/custom-paperclip/ui/src/adapters/process/parse-stdout.ts
- /content/custom-paperclip/ui/src/adapters/process/build-config.ts
- /content/custom-paperclip/ui/src/adapters/process/config-fields.tsx
- /content/custom-paperclip/ui/src/adapters/process/index.ts

## Backend Files

### Claude Local
- /content/custom-paperclip/packages/adapters/claude-local/src/cli/index.ts
- /content/custom-paperclip/packages/adapters/claude-local/src/cli/format-event.ts
- /content/custom-paperclip/packages/adapters/claude-local/src/cli/quota-probe.ts
- /content/custom-paperclip/packages/adapters/claude-local/src/server/execute.ts
- /content/custom-paperclip/packages/adapters/claude-local/src/server/index.ts
- /content/custom-paperclip/packages/adapters/claude-local/src/server/models.ts
- /content/custom-paperclip/packages/adapters/claude-local/src/server/parse.ts
- /content/custom-paperclip/packages/adapters/claude-local/src/server/prompt-cache.ts
- /content/custom-paperclip/packages/adapters/claude-local/src/server/quota.ts
- /content/custom-paperclip/packages/adapters/claude-local/src/server/skills.ts
- /content/custom-paperclip/packages/adapters/claude-local/src/server/test.ts
- /content/custom-paperclip/packages/adapters/claude-local/src/ui/build-config.ts
- /content/custom-paperclip/packages/adapters/claude-local/src/ui/index.ts
- /content/custom-paperclip/packages/adapters/claude-local/src/ui/parse-stdout.ts
- /content/custom-paperclip/packages/adapters/claude-local/src/index.ts

### Codex Local
- /content/custom-paperclip/packages/adapters/codex-local/src/cli/index.ts
- /content/custom-paperclip/packages/adapters/codex-local/src/cli/format-event.ts
- /content/custom-paperclip/packages/adapters/codex-local/src/cli/quota-probe.ts
- /content/custom-paperclip/packages/adapters/codex-local/src/server/execute.ts
- /content/custom-paperclip/packages/adapters/codex-local/src/server/index.ts
- /content/custom-paperclip/packages/adapters/codex-local/src/server/parse.ts
- /content/custom-paperclip/packages/adapters/codex-local/src/server/quota.ts
- /content/custom-paperclip/packages/adapters/codex-local/src/server/skills.ts
- /content/custom-paperclip/packages/adapters/codex-local/src/server/test.ts
- /content/custom-paperclip/packages/adapters/codex-local/src/server/quota-spawn-error.test.ts
- /content/custom-paperclip/packages/adapters/codex-local/src/server/codex-home.ts
- /content/custom-paperclip/packages/adapters/codex-local/src/server/codex-args.ts
- /content/custom-paperclip/packages/adapters/codex-local/src/server/codex-args.test.ts
- /content/custom-paperclip/packages/adapters/codex-local/src/ui/build-config.ts
- /content/custom-paperclip/packages/adapters/codex-local/src/ui/index.ts
- /content/custom-paperclip/packages/adapters/codex-local/src/ui/parse-stdout.ts
- /content/custom-paperclip/packages/adapters/codex-local/src/ui/parse-stdout.test.ts
- /content/custom-paperclip/packages/adapters/codex-local/src/ui/build-config.test.ts
- /content/custom-paperclip/packages/adapters/codex-local/src/index.ts

### Cursor Local
- /content/custom-paperclip/packages/adapters/cursor-local/src/cli/index.ts
- /content/custom-paperclip/packages/adapters/cursor-local/src/cli/format-event.ts
- /content/custom-paperclip/packages/adapters/cursor-local/src/server/execute.ts
- /content/custom-paperclip/packages/adapters/cursor-local/src/server/index.ts
- /content/custom-paperclip/packages/adapters/cursor-local/src/server/parse.ts
- /content/custom-paperclip/packages/adapters/cursor-local/src/server/skills.ts
- /content/custom-paperclip/packages/adapters/cursor-local/src/server/test.ts
- /content/custom-paperclip/packages/adapters/cursor-local/src/shared/stream.ts
- /content/custom-paperclip/packages/adapters/cursor-local/src/shared/trust.ts
- /content/custom-paperclip/packages/adapters/cursor-local/src/ui/build-config.ts
- /content/custom-paperclip/packages/adapters/cursor-local/src/ui/index.ts
- /content/custom-paperclip/packages/adapters/cursor-local/src/ui/parse-stdout.ts
- /content/custom-paperclip/packages/adapters/cursor-local/src/index.ts

### Gemini Local
- /content/custom-paperclip/packages/adapters/gemini-local/src/cli/format-event.ts
- /content/custom-paperclip/packages/adapters/gemini-local/src/cli/index.ts
- /content/custom-paperclip/packages/adapters/gemini-local/src/server/execute.ts
- /content/custom-paperclip/packages/adapters/gemini-local/src/server/index.ts
- /content/custom-paperclip/packages/adapters/gemini-local/src/server/models.ts
- /content/custom-paperclip/packages/adapters/gemini-local/src/server/parse.ts
- /content/custom-paperclip/packages/adapters/gemini-local/src/server/skills.ts
- /content/custom-paperclip/packages/adapters/gemini-local/src/server/test.ts
- /content/custom-paperclip/packages/adapters/gemini-local/src/ui/build-config.ts
- /content/custom-paperclip/packages/adapters/gemini-local/src/ui/index.ts
- /content/custom-paperclip/packages/adapters/gemini-local/src/ui/parse-stdout.ts
- /content/custom-paperclip/packages/adapters/gemini-local/src/index.ts

### OpenCLAW Gateway
- /content/custom-paperclip/packages/adapters/openclaw-gateway/src/cli/index.ts
- /content/custom-paperclip/packages/adapters/openclaw-gateway/src/cli/format-event.ts
- /content/custom-paperclip/packages/adapters/openclaw-gateway/src/server/execute.ts
- /content/custom-paperclip/packages/adapters/openclaw-gateway/src/server/execute.test.ts
- /content/custom-paperclip/packages/adapters/openclaw-gateway/src/server/index.ts
- /content/custom-paperclip/packages/adapters/openclaw-gateway/src/server/test.ts
- /content/custom-paperclip/packages/adapters/openclaw-gateway/src/shared/stream.ts
- /content/custom-paperclip/packages/adapters/openclaw-gateway/src/ui/build-config.ts
- /content/custom-paperclip/packages/adapters/openclaw-gateway/src/ui/index.ts
- /content/custom-paperclip/packages/adapters/openclaw-gateway/src/ui/parse-stdout.ts
- /content/custom-paperclip/packages/adapters/openclaw-gateway/src/index.ts

### OpenCode Local
- /content/custom-paperclip/packages/adapters/opencode-local/src/cli/index.ts
- /content/custom-paperclip/packages/adapters/opencode-local/src/cli/format-event.ts
- /content/custom-paperclip/packages/adapters/opencode-local/src/server/execute.ts
- /content/custom-paperclip/packages/adapters/opencode-local/src/server/index.ts
- /content/custom-paperclip/packages/adapters/opencode-local/src/server/models.ts
- /content/custom-paperclip/packages/adapters/opencode-local/src/server/models.test.ts
- /content/custom-paperclip/packages/adapters/opencode-local/src/server/parse.ts
- /content/custom-paperclip/packages/adapters/opencode-local/src/server/parse.test.ts
- /content/custom-paperclip/packages/adapters/opencode-local/src/server/runtime-config.ts
- /content/custom-paperclip/packages/adapters/opencode-local/src/server/runtime-config.test.ts
- /content/custom-paperclip/packages/adapters/opencode-local/src/server/skills.ts
- /content/custom-paperclip/packages/adapters/opencode-local/src/server/test.ts
- /content/custom-paperclip/packages/adapters/opencode-local/src/ui/build-config.ts
- /content/custom-paperclip/packages/adapters/opencode-local/src/ui/index.ts
- /content/custom-paperclip/packages/adapters/opencode-local/src/ui/parse-stdout.ts
- /content/custom-paperclip/packages/adapters/opencode-local/src/index.ts

### OpenCode Remote
- /content/custom-paperclip/packages/adapters/opencode-remote/src/cli/index.ts
- /content/custom-paperclip/packages/adapters/opencode-remote/src/server/execute.ts
- /content/custom-paperclip/packages/adapters/opencode-remote/src/server/index.ts
- /content/custom-paperclip/packages/adapters/opencode-remote/src/server/models.ts
- /content/custom-paperclip/packages/adapters/opencode-remote/src/server/parse.ts
- /content/custom-paperclip/packages/adapters/opencode-remote/src/server/skills.ts
- /content/custom-paperclip/packages/adapters/opencode-remote/src/ui/build-config.ts
- /content/custom-paperclip/packages/adapters/opencode-remote/src/ui/index.ts
- /content/custom-paperclip/packages/adapters/opencode-remote/src/ui/parse-stdout.ts

### OpenRouter
- /content/custom-paperclip/packages/adapters/openrouter/src/cli/index.ts
- /content/custom-paperclip/packages/adapters/openrouter/src/cli/format-event.ts
- /content/custom-paperclip/packages/adapters/openrouter/src/server/execute.ts
- /content/custom-paperclip/packages/adapters/openrouter/src/server/index.ts
- /content/custom-paperclip/packages/adapters/openrouter/src/server/models.ts
- /content/custom-paperclip/packages/adapters/openrouter/src/server/parse.ts
- /content/custom-paperclip/packages/adapters/openrouter/src/server/skills.ts
- /content/custom-paperclip/packages/adapters/openrouter/src/server/test.ts
- /content/custom-paperclip/packages/adapters/openrouter/src/ui/build-config.ts
- /content/custom-paperclip/packages/adapters/openrouter/src/ui/index.ts
- /content/custom-paperclip/packages/adapters/openrouter/src/ui/parse-stdout.ts
- /content/custom-paperclip/packages/adapters/openrouter/src/index.ts

### PI Local
- /content/custom-paperclip/packages/adapters/pi-local/src/cli/index.ts
- /content/custom-paperclip/packages/adapters/pi-local/src/cli/format-event.ts
- /content/custom-paperclip/packages/adapters/pi-local/src/server/execute.ts
- /content/custom-paperclip/packages/adapters/pi-local/src/server/index.ts
- /content/custom-paperclip/packages/adapters/pi-local/src/server/models.ts
- /content/custom-paperclip/packages/adapters/pi-local/src/server/models.test.ts
- /content/custom-paperclip/packages/adapters/pi-local/src/server/parse.ts
- /content/custom-paperclip/packages/adapters/pi-local/src/server/parse.test.ts
- /content/custom-paperclip/packages/adapters/pi-local/src/server/skills.ts
- /content/custom-paperclip/packages/adapters/pi-local/src/server/test.ts
- /content/custom-paperclip/packages/adapters/pi-local/src/ui/build-config.ts
- /content/custom-paperclip/packages/adapters/pi-local/src/ui/index.ts
- /content/custom-paperclip/packages/adapters/pi-local/src/ui/parse-stdout.ts
- /content/custom-paperclip/packages/adapters/pi-local/src/index.ts

## Onboarding Files

### Frontend
- /content/custom-paperclip/ui/src/components/Layout.tsx (onboardingTriggered)
- /content/custom-paperclip/ui/src/components/OnboardingWizard.tsx
- /content/custom-paperclip/ui/src/context/DialogContext.tsx (onboardingOpen, onboardingOptions)
- /content/custom-paperclip/ui/src/lib/onboarding-goal.ts
- /content/custom-paperclip/ui/src/lib/onboarding-goal.test.ts
- /content/custom-paperclip/ui/src/lib/onboarding-launch.ts
- /content/custom-paperclip/ui/src/lib/onboarding-launch.test.ts
- /content/custom-paperclip/ui/src/lib/onboarding-route.ts
- /content/custom-paperclip/ui/src/lib/onboarding-route.test.ts
- /content/custom-paperclip/ui/src/pages/CompanyInvites.test.tsx
- /content/custom-paperclip/ui/src/pages/CompanySettings.tsx (onboarding management)
- /content/custom-paperclip/ui/src/pages/InviteLanding.tsx (onboardingTextUrl)
- /content/custom-paperclip/ui/src/pages/InviteUxLab.tsx (onboarding testing)
- /content/custom-paperclip/ui/src/api/access.ts (onboarding API calls)

### Backend
- /content/custom-paperclip/server/src/__tests__/invite-onboarding-text.test.ts
- /content/custom-paperclip/server/src/__tests__/openclaw-invite-prompt-route.test.ts
- /content/custom-paperclip/server/src/routes/access.ts (onboarding endpoints at lines 3070-3110)
- /content/custom-paperclip/tests/e2e/onboarding.spec.ts
- /content/custom-paperclip/tests/release-smoke/docker-auth-onboarding.spec.ts
- /content/custom-paperclip/ui/storybook/stories/overview.stories.tsx (onboarding mention)
- /content/custom-paperclip/ui/storybook/stories/data-viz-misc.stories.tsx (onboarding mention)
- /content/custom-paperclip/ui/src/App.tsx (OnboardingRoutePage component)