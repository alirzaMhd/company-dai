export function parseOpenCodeRemoteJsonl(stdout) {
    for (const line of stdout.trim().split("\n")) {
        if (!line)
            continue;
        try {
            const data = JSON.parse(line);
            if (data.type === "result") {
                return data;
            }
        }
        catch {
            continue;
        }
    }
    return null;
}
export function isOpenCodeRemoteUnknownSessionError(result) {
    const error = result.error;
    if (typeof error !== "string")
        return false;
    return error.includes("Unknown session") || error.includes("Session not found");
}
//# sourceMappingURL=parse.js.map