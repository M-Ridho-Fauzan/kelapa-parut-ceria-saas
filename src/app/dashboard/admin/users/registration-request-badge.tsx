"use client";

import * as React from "react";
import { getPendingRequestCount } from "@/app/actions/registration";
import { Badge } from "@/components/ui/badge";

export function RegistrationRequestBadge() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    getPendingRequestCount()
      .then((data) => { if (!cancelled) setCount(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (count === 0) return null;

  return (
    <Badge variant="destructive" className="ml-2 size-5 flex items-center justify-center text-xs p-0">
      {count > 99 ? "99+" : count}
    </Badge>
  );
}
