export function buildOpenCodeRemoteConfig(v) {
    const ac = {};
    if (v.cwd)
        ac.cwd = v.cwd;
    if (v.instructionsFilePath)
        ac.instructionsFilePath = v.instructionsFilePath;
    if (v.promptTemplate)
        ac.promptTemplate = v.promptTemplate;
    if (v.bootstrapPrompt)
        ac.bootstrapPromptTemplate = v.bootstrapPrompt;
    if (v.model)
        ac.model = v.model;
    if (v.thinkingEffort)
        ac.variant = v.thinkingEffort;
    if (v.extraArgs)
        ac.extraArgs = v.extraArgs.split(",").map((s) => s.trim()).filter(Boolean);
    if (v.tunnelUrl)
        ac.tunnelUrl = v.tunnelUrl;
    return ac;
}
//# sourceMappingURL=build-config.js.map