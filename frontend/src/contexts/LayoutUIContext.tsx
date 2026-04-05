import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface LayoutUIContextValue {
    sidebarOpen: boolean;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    toggleSidebar: () => void;
    collapseSidebar: () => void;
    expandSidebar: () => void;
}

const LayoutUIContext = createContext<LayoutUIContextValue | null>(null);

interface LayoutUIProviderProps {
    children: React.ReactNode;
    initialSidebarOpen?: boolean;
}

export const LayoutUIProvider: React.FC<LayoutUIProviderProps> = ({
    children,
    initialSidebarOpen = true,
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen);

    const toggleSidebar = useCallback(() => {
        setSidebarOpen((prev) => !prev);
    }, []);

    const collapseSidebar = useCallback(() => {
        setSidebarOpen(false);
    }, []);

    const expandSidebar = useCallback(() => {
        setSidebarOpen(true);
    }, []);

    const value = useMemo(
        () => ({
            sidebarOpen,
            setSidebarOpen,
            toggleSidebar,
            collapseSidebar,
            expandSidebar,
        }),
        [sidebarOpen, toggleSidebar, collapseSidebar, expandSidebar]
    );

    return <LayoutUIContext.Provider value={value}>{children}</LayoutUIContext.Provider>;
};

export function useLayoutUI() {
    const context = useContext(LayoutUIContext);
    if (!context) {
        throw new Error('useLayoutUI must be used within a LayoutUIProvider');
    }
    return context;
}
