export interface ToastData {
  title: string;
  description: string;
  type: "success" | "error" | "info" | "warning" | "loading";
}

export interface ActionResponse {
  error?: string;
  success?: boolean;
  toast?: ToastData;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  group: string;
  type: string;
  label: string;
}

export interface AuthSettings {
  sessionExpiryHours: number;
  cookieSecure: boolean;
  cookieHttpOnly: boolean;
}

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export interface NavGroup {
  icon?: React.ElementType;
  label: string;
  items: NavItem[];
}
