export const type = "opencode_remote";
export const label = "OpenCode Remote";
export function formatEvent(event) {
    if (event.stream === "stdout")
        return event.data;
    if (event.stream === "stderr")
        return event.data;
    if (event.stream === "system")
        return event.data;
    return "";
}
//# sourceMappingURL=index.js.map