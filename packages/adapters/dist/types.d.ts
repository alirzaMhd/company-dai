export interface AdapterAgent {
    id: string;
    companyId: string;
    name: string;
    adapterType: string | null;
    adapterConfig: unknown;
}
export interface AdapterRuntime {
    /**
     * Legacy single session id view. Prefer `sessionParams` + `sessionDisplayId`.
     */
    sessionId: string | null;
    sessionParams: Record<string, unknown> | null;
    sessionDisplayId: string | null;
    taskKey: string | null;
}
export interface UsageSummary {
    inputTokens: number;
    outputTokens: number;
    cachedInputTokens?: number;
}
export type AdapterBillingType = "api" | "subscription" | "metered_api" | "subscription_included" | "subscription_overage" | "credits" | "fixed" | "unknown";
export interface AdapterRuntimeServiceReport {
    id?: string | null;
    projectId?: string | null;
    projectWorkspaceId?: string | null;
    issueId?: string | null;
    scopeType?: "project_workspace" | "execution_workspace" | "run" | "agent";
    scopeId?: string | null;
    serviceName: string;
    status?: "starting" | "running" | "stopped" | "failed";
    lifecycle?: "shared" | "ephemeral";
    reuseKey?: string | null;
    command?: string | null;
    cwd?: string | null;
    port?: number | null;
    url?: string | null;
    providerRef?: string | null;
    ownerAgentId?: string | null;
    stopPolicy?: Record<string, unknown> | null;
    healthStatus?: "unknown" | "healthy" | "unhealthy";
}
export interface AdapterExecutionResult {
    exitCode: number | null;
    signal: string | null;
    timedOut: boolean;
    errorMessage?: string | null;
    errorCode?: string | null;
    errorMeta?: Record<string, unknown>;
    usage?: UsageSummary;
    /**
     * Legacy single session id output. Prefer `sessionParams` + `sessionDisplayId`.
     */
    sessionId?: string | null;
    sessionParams?: Record<string, unknown> | null;
    sessionDisplayId?: string | null;
    provider?: string | null;
    biller?: string | null;
    model?: string | null;
    billingType?: AdapterBillingType | null;
    costUsd?: number | null;
    resultJson?: Record<string, unknown> | null;
    runtimeServices?: AdapterRuntimeServiceReport[];
    summary?: string | null;
    clearSession?: boolean;
    question?: {
        prompt: string;
        choices: Array<{
            key: string;
            label: string;
            description?: string;
        }>;
    } | null;
}
export interface AdapterSessionCodec {
    deserialize(raw: unknown): Record<string, unknown> | null;
    serialize(params: Record<string, unknown> | null): Record<string, unknown> | null;
    getDisplayId?: (params: Record<string, unknown> | null) => string | null;
}
export interface AdapterInvocationMeta {
    adapterType: string;
    command: string;
    cwd?: string;
    commandArgs?: string[];
    commandNotes?: string[];
    env?: Record<string, string>;
    prompt?: string;
    promptMetrics?: Record<string, number>;
    context?: Record<string, unknown>;
}
export interface AdapterExecutionContext {
    runId: string;
    agent: AdapterAgent;
    runtime: AdapterRuntime;
    config: Record<string, unknown>;
    context: Record<string, unknown>;
    onLog: (stream: "stdout" | "stderr", chunk: string) => Promise<void>;
    onMeta?: (meta: AdapterInvocationMeta) => Promise<void>;
    onSpawn?: (meta: {
        pid: number;
        processGroupId: number | null;
        startedAt: string;
    }) => Promise<void>;
    authToken?: string;
}
export interface AdapterModel {
    id: string;
    label: string;
}
export type AdapterEnvironmentCheckLevel = "info" | "warn" | "error";
export interface AdapterEnvironmentCheck {
    code: string;
    level: AdapterEnvironmentCheckLevel;
    message: string;
    detail?: string | null;
    hint?: string | null;
}
export type AdapterEnvironmentTestStatus = "pass" | "warn" | "fail";
export interface AdapterEnvironmentTestResult {
    adapterType: string;
    status: AdapterEnvironmentTestStatus;
    checks: AdapterEnvironmentCheck[];
    testedAt: string;
}
export type AdapterSkillSyncMode = "unsupported" | "persistent" | "ephemeral";
export type AdapterSkillState = "available" | "configured" | "installed" | "missing" | "stale" | "external";
export type AdapterSkillOrigin = "company_managed" | "paperclip_required" | "user_installed" | "external_unknown";
export interface AdapterSkillEntry {
    key: string;
    runtimeName: string | null;
    desired: boolean;
    managed: boolean;
    required?: boolean;
    requiredReason?: string | null;
    state: AdapterSkillState;
    origin?: AdapterSkillOrigin;
    originLabel?: string | null;
    locationLabel?: string | null;
    readOnly?: boolean;
    sourcePath?: string | null;
    targetPath?: string | null;
    detail?: string | null;
}
export interface AdapterSkillSnapshot {
    adapterType: string;
    supported: boolean;
    mode: AdapterSkillSyncMode;
    desiredSkills: string[];
    entries: AdapterSkillEntry[];
    warnings: string[];
}
export interface AdapterSkillContext {
    agentId: string;
    companyId: string;
    adapterType: string;
    config: Record<string, unknown>;
}
export interface AdapterEnvironmentTestContext {
    companyId: string;
    adapterType: string;
    config: Record<string, unknown>;
    deployment?: {
        mode?: "local_trusted" | "authenticated";
        exposure?: "private" | "public";
        bindHost?: string | null;
        allowedHostnames?: string[];
    };
}
/** Payload for the onHireApproved adapter lifecycle hook. */
export interface HireApprovedPayload {
    companyId: string;
    agentId: string;
    agentName: string;
    adapterType: string;
    source: "join_request" | "approval";
    sourceId: string;
    approvedAt: string;
    message: string;
}
/** Result of onHireApproved hook; failures are non-fatal to the approval flow. */
export interface HireApprovedHookResult {
    ok: boolean;
    error?: string;
    detail?: Record<string, unknown>;
}
export interface QuotaWindow {
    label: string;
    usedPercent: number | null;
    resetsAt: string | null;
    valueLabel: string | null;
    detail?: string | null;
}
export interface ProviderQuotaResult {
    provider: string;
    source?: string | null;
    ok: boolean;
    error?: string;
    windows: QuotaWindow[];
}
export interface ConfigFieldOption {
    label: string;
    value: string;
    group?: string;
}
export interface ConfigFieldSchema {
    key: string;
    label: string;
    type: "text" | "select" | "toggle" | "number" | "textarea" | "combobox";
    options?: ConfigFieldOption[];
    default?: unknown;
    hint?: string;
    required?: boolean;
    group?: string;
    meta?: Record<string, unknown>;
}
export interface AdapterConfigSchema {
    fields: ConfigFieldSchema[];
}
export interface ServerAdapterModule {
    type: string;
    execute(ctx: AdapterExecutionContext): Promise<AdapterExecutionResult>;
    testEnvironment(ctx: AdapterEnvironmentTestContext): Promise<AdapterEnvironmentTestResult>;
    listSkills?: (ctx: AdapterSkillContext) => Promise<AdapterSkillSnapshot>;
    syncSkills?: (ctx: AdapterSkillContext, desiredSkills: string[]) => Promise<AdapterSkillSnapshot>;
    sessionCodec?: AdapterSessionCodec;
    sessionManagement?: AdapterSessionManagement;
    supportsLocalAgentJwt?: boolean;
    models?: AdapterModel[];
    listModels?: (config?: Record<string, unknown>) => Promise<AdapterModel[]>;
    agentConfigurationDoc?: string;
    onHireApproved?: (payload: HireApprovedPayload, adapterConfig: Record<string, unknown>) => Promise<HireApprovedHookResult>;
    getQuotaWindows?: () => Promise<ProviderQuotaResult>;
    detectModel?: () => Promise<{
        model: string;
        provider: string;
        source: string;
        candidates?: string[];
    } | null>;
    getConfigSchema?: () => Promise<AdapterConfigSchema> | AdapterConfigSchema;
    supportsInstructionsBundle?: boolean;
    instructionsPathKey?: string;
    requiresMaterializedRuntimeSkills?: boolean;
}
export interface AdapterSessionManagement {
    compactSessions: (params: {
        agentId: string;
        companyId: string;
        maxSessions: number;
        dryRun?: boolean;
        onLog?: (message: string) => void;
    }) => Promise<{
        removed: number;
        kept: number;
        sessions: unknown[];
    }>;
    listSessions: (params: {
        agentId: string;
        companyId: string;
    }) => Promise<{
        sessions: unknown[];
    }>;
    dropSession: (params: {
        agentId: string;
        companyId: string;
        sessionId: string;
    }) => Promise<{
        dropped: boolean;
    }>;
}
export type TranscriptEntry = {
    kind: "assistant";
    ts: string;
    text: string;
    delta?: boolean;
} | {
    kind: "thinking";
    ts: string;
    text: string;
    delta?: boolean;
} | {
    kind: "user";
    ts: string;
    text: string;
} | {
    kind: "tool_call";
    ts: string;
    name: string;
    input: unknown;
    toolUseId?: string;
} | {
    kind: "tool_result";
    ts: string;
    toolUseId: string;
    toolName?: string;
    content: string;
    isError: boolean;
} | {
    kind: "init";
    ts: string;
    model: string;
    sessionId: string;
} | {
    kind: "result";
    ts: string;
    text: string;
    inputTokens: number;
    outputTokens: number;
    cachedTokens: number;
    costUsd: number;
    subtype: string;
    isError: boolean;
    errors: string[];
} | {
    kind: "stderr";
    ts: string;
    text: string;
} | {
    kind: "system";
    ts: string;
    text: string;
} | {
    kind: "stdout";
    ts: string;
    text: string;
} | {
    kind: "diff";
    ts: string;
    changeType: "add" | "remove" | "context" | "hunk" | "file_header" | "truncation";
    text: string;
};
export type StdoutLineParser = (line: string, ts: string) => TranscriptEntry[];
export interface CLIAdapterModule {
    type: string;
    formatStdoutEvent: (line: string, debug: boolean) => void;
}
export interface CreateConfigValues {
    adapterType: string;
    cwd: string;
    instructionsFilePath?: string;
    promptTemplate: string;
    model: string;
    thinkingEffort: string;
    chrome: boolean;
    dangerouslySkipPermissions: boolean;
    search: boolean;
    fastMode: boolean;
    dangerouslyBypassSandbox: boolean;
    command: string;
    args: string;
    extraArgs: string;
    envVars: string;
    envBindings: Record<string, unknown>;
    url: string;
    bootstrapPrompt: string;
    payloadTemplateJson?: string;
    workspaceStrategyType?: string;
    workspaceBaseRef?: string;
    workspaceBranchTemplate?: string;
    worktreeParentDir?: string;
    runtimeServicesJson?: string;
    maxTurnsPerRun: number;
    heartbeatEnabled: boolean;
    intervalSec: number;
    adapterSchemaValues?: Record<string, unknown>;
    apiKeys?: string[];
    tunnelUrl?: string;
}
//# sourceMappingURL=types.d.ts.map