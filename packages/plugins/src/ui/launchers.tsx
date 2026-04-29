import React, { createContext, useContext, useCallback, ReactNode } from 'react';

export interface NavigationTarget {
  page?: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

export interface ModalConfig {
  component: React.ComponentType<ModalProps>;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  closeOnOverlayClick?: boolean;
}

export interface ModalProps {
  onClose: () => void;
  [key: string]: unknown;
}

export interface DrawerConfig {
  component: React.ComponentType<DrawerProps>;
  title?: string;
  width?: number | string;
  position?: 'left' | 'right';
}

export interface DrawerProps {
  onClose: () => void;
  [key: string]: unknown;
}

interface LaunchersContextValue {
  navigate: (target: NavigationTarget) => void;
  openModal: (config: ModalConfig) => void;
  openDrawer: (config: DrawerConfig) => void;
  closeModal: () => void;
  closeDrawer: () => void;
}

const LaunchersContext = createContext<LaunchersContextValue | null>(null);

export function LaunchersProvider({ children }: { children: ReactNode }) {
  const navigate = useCallback((target: NavigationTarget) => {
    const path = target.page 
      ? `/${target.page}${target.params ? '/' + Object.values(target.params).join('/') : ''}`
      : '/';
    
    const query = target.query 
      ? '?' + new URLSearchParams(target.query).toString()
      : '';
    
    window.location.href = path + query;
  }, []);

  const openModal = useCallback((config: ModalConfig) => {
    console.log('[Plugin Launcher] Opening modal:', config.title);
  }, []);

  const openDrawer = useCallback((config: DrawerConfig) => {
    console.log('[Plugin Launcher] Opening drawer:', config.title);
  }, []);

  const closeModal = useCallback(() => {
    console.log('[Plugin Launcher] Closing modal');
  }, []);

  const closeDrawer = useCallback(() => {
    console.log('[Plugin Launcher] Closing drawer');
  }, []);

  return (
    <LaunchersContext.Provider value={{ 
      navigate, 
      openModal, 
      openDrawer, 
      closeModal, 
      closeDrawer 
    }}>
      {children}
    </LaunchersContext.Provider>
  );
}

export function useLaunchers() {
  const context = useContext(LaunchersContext);
  if (!context) {
    throw new Error('useLaunchers must be used within LaunchersProvider');
  }
  return context;
}

export function useNavigate() {
  const { navigate } = useLaunchers();
  return navigate;
}

export function useModal() {
  const { openModal, closeModal } = useLaunchers();
  return { open: openModal, close: closeModal };
}

export function useDrawer() {
  const { openDrawer, closeDrawer } = useLaunchers();
  return { open: openDrawer, close: closeDrawer };
}