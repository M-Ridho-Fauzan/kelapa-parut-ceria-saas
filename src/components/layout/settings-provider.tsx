"use client";

import * as React from "react";

type SettingsTab = "profile" | "security" | "auth-options";

interface SettingsContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
}

const SettingsContext = React.createContext<SettingsContextType>({
  open: false,
  setOpen: () => {},
  activeTab: "profile",
  setActiveTab: () => {},
});

export function useSettings() {
  return React.useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("profile");

  return (
    <SettingsContext.Provider value={{ open, setOpen, activeTab, setActiveTab }}>
      {children}
    </SettingsContext.Provider>
  );
}
