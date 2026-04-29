import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type SlotName = 
  | 'page'
  | 'sidebar'
  | 'sidebarPanel'
  | 'settingsPage'
  | 'dashboardWidget'
  | 'detailTab'
  | 'taskDetailView'
  | 'toolbarButton'
  | 'commentAnnotation';

export interface SlotRegistration {
  pluginKey: string;
  slot: SlotName;
  component: React.ComponentType<SlotProps>;
  priority?: number;
  options?: Record<string, unknown>;
}

export interface SlotProps {
  [key: string]: unknown;
}

interface SlotContextValue {
  register: (registration: SlotRegistration) => void;
  unregister: (pluginKey: string, slot: SlotName) => void;
  getComponents: (slot: SlotName) => SlotRegistration[];
}

const SlotContext = createContext<SlotContextValue | null>(null);

export function SlotProvider({ children }: { children: ReactNode }) {
  const [registrations, setRegistrations] = useState<SlotRegistration[]>([]);

  const register = useCallback((registration: SlotRegistration) => {
    setRegistrations((prev: SlotRegistration[]) => {
      const filtered = prev.filter(
        (r: SlotRegistration) => !(r.pluginKey === registration.pluginKey && r.slot === registration.slot)
      );
      return [...filtered, registration].sort((a: SlotRegistration, b: SlotRegistration) => 
        (b.priority || 0) - (a.priority || 0)
      );
    });
  }, []);

  const unregister = useCallback((pluginKey: string, slot: SlotName) => {
    setRegistrations((prev: SlotRegistration[]) => 
      prev.filter((r: SlotRegistration) => !(r.pluginKey === pluginKey && r.slot === slot))
    );
  }, []);

  const getComponents = useCallback((slot: SlotName): SlotRegistration[] => {
    return registrations.filter((r: SlotRegistration) => r.slot === slot);
  }, [registrations]);

  return (
    <SlotContext.Provider value={{ register, unregister, getComponents }}>
      {children}
    </SlotContext.Provider>
  );
}

export function useSlots() {
  const context = useContext(SlotContext);
  if (!context) {
    throw new Error('useSlots must be used within SlotProvider');
  }
  return context;
}

export function useSlot(slot: SlotName, props?: SlotProps): React.ReactElement[] {
  const { getComponents } = useSlots();
  const components = getComponents(slot);
  
  return components.map((reg: SlotRegistration, index: number) => (
    <reg.component key={`${reg.pluginKey}-${index}`} {...props} />
  ));
}

export function renderSlot(slot: SlotName, props?: SlotProps): React.ReactElement[] {
  const { getComponents } = useSlots();
  const components = getComponents(slot);
  
  return components.map((reg: SlotRegistration, index: number) => (
    <reg.component key={`${reg.pluginKey}-${index}`} {...props} />
  ));
}