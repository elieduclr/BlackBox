import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ShortcutHandler = () => void;

interface ShortcutContextType {
  registerShortcut: (key: string, handler: ShortcutHandler) => void;
  unregisterShortcut: (key: string) => void;
}

const ShortcutContext = createContext<ShortcutContextType>({
  registerShortcut: () => {},
  unregisterShortcut: () => {},
});

interface ShortcutProviderProps {
  children: ReactNode;
}

export const ShortcutProvider: React.FC<ShortcutProviderProps> = ({ children }) => {
  const [shortcuts, setShortcuts] = useState<Record<string, ShortcutHandler>>({});

  const registerShortcut = useCallback((key: string, handler: ShortcutHandler) => {
    setShortcuts(prev => ({ ...prev, [key]: handler }));
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    setShortcuts(prev => {
      const newShortcuts = { ...prev };
      delete newShortcuts[key];
      return newShortcuts;
    });
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Create a key string from the event
      const key = `${e.ctrlKey ? 'Ctrl+' : ''}${e.altKey ? 'Alt+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`;
      
      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return (
    <ShortcutContext.Provider value={{ registerShortcut, unregisterShortcut }}>
      {children}
    </ShortcutContext.Provider>
  );
};

export const useShortcut = () => useContext(ShortcutContext);