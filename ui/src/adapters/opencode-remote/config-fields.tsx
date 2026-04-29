import type { AdapterConfigFieldsProps } from "../types";
import {
  Field,
  DraftInput,
  help,
} from "../../components/agent-config-primitives";

const inputClass =
  "w-full rounded-md border border-border px-2.5 py-1.5 bg-transparent outline-none text-sm font-mono placeholder:text-muted-foreground/40";

export function OpenCodeRemoteConfigFields({
  isCreate,
  values,
  set,
  config,
  eff,
  mark,
  hideInstructionsFile,
}: AdapterConfigFieldsProps) {
  return (
    <>
      <Field label="WebSocket Tunnel URL" hint="wss://xxx.trycloudflare.com from Colab">
        <DraftInput
          value={
            isCreate
              ? values!.tunnelUrl ?? ""
              : eff(
                  "adapterConfig",
                  "tunnelUrl",
                  String(config.tunnelUrl ?? ""),
                )
          }
          onCommit={(v) =>
            isCreate
              ? set!({ tunnelUrl: v })
              : mark("adapterConfig", "tunnelUrl", v || undefined)
          }
          immediate
          className={inputClass}
          placeholder="wss://xxx.trycloudflare.com"
        />
      </Field>
      {!hideInstructionsFile && (
        <Field label="Agent instructions file" hint={help.instructionsFile}>
          <DraftInput
            value={
              isCreate
                ? values!.instructionsFilePath ?? ""
                : eff(
                    "adapterConfig",
                    "instructionsFilePath",
                    String(config.instructionsFilePath ?? ""),
                  )
            }
            onCommit={(v) =>
              isCreate
                ? set!({ instructionsFilePath: v })
                : mark("adapterConfig", "instructionsFilePath", v || undefined)
            }
            immediate
            className={inputClass}
            placeholder="/absolute/path/to/AGENTS.md"
          />
        </Field>
      )}
    </>
  );
}