import { useState, useEffect } from "react";
import type { AdapterConfigFieldsProps } from "../types";
import {
  Field,
  DraftInput,
  help,
} from "../../components/agent-config-primitives";
import { agentsApi } from "../../api/agents";

const inputClass =
  "w-full rounded-md border border-border px-2.5 py-1.5 bg-transparent outline-none text-sm font-mono placeholder:text-muted-foreground/40";

interface ApiKeyEntry {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
}

function redactKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}

export function OpenRouterConfigFields({
  isCreate,
  values,
  set,
  config,
  eff,
  mark,
  selectedCompanyId,
}: AdapterConfigFieldsProps) {
  const [modelInput, setModelInput] = useState("");
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [newKeyInput, setNewKeyInput] = useState("");
  const [showNewKey, setShowNewKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiKeysError, setApiKeysError] = useState<string | null>(null);

  useEffect(() => {
    if (isCreate) {
      if (values?.model) setModelInput(values.model as string);
      if (values?.apiKeys) setApiKeys(values.apiKeys as string[]);
    } else {
      if (config?.model) setModelInput(config.model as string);
      if (config?.apiKeys && Array.isArray(config.apiKeys)) {
        setApiKeys(config.apiKeys.filter((k) => typeof k === "string"));
      }
    }
  }, [isCreate, values, config]);

  const currentApiKeys = isCreate
    ? (values?.apiKeys as string[] | undefined) ?? []
    : (config?.apiKeys as string[] | undefined) ?? [];

  const handleAddKey = async () => {
    const key = newKeyInput.trim();
    if (!key || !selectedCompanyId) return;

    setSaving(true);
    setApiKeysError(null);

    try {
      await agentsApi.createAgentApiKey(selectedCompanyId, {
        name: `Key ${apiKeys.length + 1}`,
        key: key,
        provider: "openrouter",
      });

      const nextKeys = [...currentApiKeys, key];
      if (isCreate) {
        set!({ apiKeys: nextKeys });
      } else {
        mark("adapterConfig", "apiKeys", nextKeys);
      }

      setNewKeyInput("");
      setShowNewKey(false);
    } catch (err) {
      setApiKeysError(err instanceof Error ? err.message : "Failed to add API key");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveKey = async (keyToRemove: string) => {
    const nextKeys = currentApiKeys.filter((k) => k !== keyToRemove);
    if (isCreate) {
      set!({ apiKeys: nextKeys });
    } else {
      mark("adapterConfig", "apiKeys", nextKeys);
    }
  };

  const handleModelChange = (value: string) => {
    setModelInput(value);
    if (isCreate) {
      set!({ model: value });
    } else {
      mark("adapterConfig", "model", value || undefined);
    }
  };

  return (
    <>
      <Field label="Model" hint="OpenRouter model ID (e.g., anthropic/claude-3.5-sonnet)">
        <DraftInput
          value={modelInput}
          onCommit={handleModelChange}
          immediate
          className={inputClass}
          placeholder="anthropic/claude-3.5-sonnet"
        />
      </Field>

      <Field label="API Keys" hint="Multiple keys enable automatic rotation on rate limits">
        <div className="space-y-2">
          {currentApiKeys.length > 0 && (
            <div className="flex flex-col gap-1">
              {currentApiKeys.map((key, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border border-border px-2.5 py-1.5 bg-muted/30"
                >
                  <span className="text-sm font-mono">{redactKey(key)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKey(key)}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {showNewKey ? (
            <div className="flex items-center gap-2">
              <DraftInput
                value={newKeyInput}
                onCommit={(v) => setNewKeyInput(v)}
                immediate
                className={inputClass}
                placeholder="sk-or-v1-..."
              />
              <button
                type="button"
                onClick={handleAddKey}
                disabled={saving || !newKeyInput.trim() || !selectedCompanyId}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewKey(false);
                  setNewKeyInput("");
                  setApiKeysError(null);
                }}
                className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewKey(true)}
              className="rounded-md border border-dashed border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              + Add API Key
            </button>
          )}

          {apiKeysError && (
            <p className="text-xs text-destructive">{apiKeysError}</p>
          )}
        </div>
      </Field>
    </>
  );
}