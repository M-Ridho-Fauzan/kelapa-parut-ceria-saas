"use client";

import * as React from "react";

type SettingsTab = string;

interface SettingsContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
}

const SettingsContext = React.createContext<SettingsContextType>({
  open: false,
  setOpen: () => {},
  activeTab: "profile-form",  // Default to first tab key
  setActiveTab: () => {},
});

export function useSettings() {
  return React.useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("profile-form");

  return (
    <SettingsContext.Provider value={{ open, setOpen, activeTab, setActiveTab }}>
      {children}
    </SettingsContext.Provider>
  );
}
