"use client";

import * as React from "react";
import { RegistrationRequestsDialog } from "./registration-requests-dialog";
import { RegistrationRequestBadge } from "./registration-request-badge";
import { Button } from "@/components/ui/button";
import { IconUsers } from "@tabler/icons-react";

export function RegistrationRequestsButton() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <IconUsers data-icon="inline-start" />
        Request Pendaftaran
        <RegistrationRequestBadge />
      </Button>
      <RegistrationRequestsDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
