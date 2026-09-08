"use client";

import * as React from "react";
import { getPendingRequestCount } from "@/app/actions/registration";
import { Badge } from "@/components/ui/badge";

export function PendingRequestBadge() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    getPendingRequestCount().then(setCount);
  }, []);

  if (count === 0) return null;

  return (
    <Badge variant="destructive" className="ml-auto size-5 flex items-center justify-center text-xs p-0">
      {count > 99 ? "99+" : count}
    </Badge>
  );
}
