import { useEffect, useState, useCallback } from 'react';

export interface UsePluginStateOptions<T> {
  pluginKey: string;
  key: string;
  defaultValue?: T;
}

export function usePluginState<T>(options: UsePluginStateOptions<T>) {
  const { pluginKey, key, defaultValue } = options;
  const [value, setValue] = useState<T | undefined>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadValue = async () => {
      setLoading(true);
      try {
        const stored = localStorage.getItem(`plugin_${pluginKey}_${key}`);
        if (stored) {
          setValue(JSON.parse(stored));
        }
      } catch (error) {
        console.error(`[Plugin ${pluginKey}] Failed to load state for ${key}:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [pluginKey, key]);

  const updateValue = useCallback((newValue: T | ((prev: T | undefined) => T)) => {
    setValue(prev => {
      const resolved = typeof newValue === 'function' 
        ? (newValue as (prev: T | undefined) => T)(prev)
        : newValue;
      
      localStorage.setItem(`plugin_${pluginKey}_${key}`, JSON.stringify(resolved));
      return resolved;
    });
  }, [pluginKey, key]);

  return { value, setValue: updateValue, loading };
}

export interface UsePluginEventOptions {
  pluginKey: string;
  event: string;
}

export function usePluginEvent<T>(options: UsePluginEventOptions, handler: (data: T) => void) {
  const { pluginKey, event } = options;

  useEffect(() => {
    const handleEvent = (e: CustomEvent<T>) => {
      handler(e.detail);
    };

    window.addEventListener(`plugin:${pluginKey}:${event}`, handleEvent as EventListener);
    return () => {
      window.removeEventListener(`plugin:${pluginKey}:${event}`, handleEvent as EventListener);
    };
  }, [pluginKey, event, handler]);
}

export function emitPluginEvent<T>(pluginKey: string, event: string, data: T) {
  window.dispatchEvent(new CustomEvent(`plugin:${pluginKey}:${event}`, { detail: data }));
}

export function usePluginConfig<T>(pluginKey: string) {
  const [config, setConfig] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/plugins/${pluginKey}/config`);
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        }
      } catch (error) {
        console.error(`[Plugin ${pluginKey}] Failed to load config:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [pluginKey]);

  const updateConfig = useCallback(async (newConfig: Partial<T>) => {
    try {
      const response = await fetch(`/api/plugins/${pluginKey}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        return true;
      }
    } catch (error) {
      console.error(`[Plugin ${pluginKey}] Failed to update config:`, error);
    }
    return false;
  }, [pluginKey]);

  return { config, updateConfig, loading };
}