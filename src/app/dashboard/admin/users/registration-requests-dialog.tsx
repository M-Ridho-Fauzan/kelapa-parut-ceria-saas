"use client";

import * as React from "react";
import {
  approveRegistrationRequest,
  rejectRegistrationRequest,
  getRegistrationRequests,
} from "@/app/actions/registration";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
  IconCheck,
  IconX,
  IconDotsVertical,
  IconFilter,
} from "@tabler/icons-react";

type RegistrationRequest = {
  id: string;
  name: string | null;
  email: string;
  status: string;
  reason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  EXPIRED: "Kedaluwarsa",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  APPROVED: "default",
  REJECTED: "destructive",
  EXPIRED: "secondary",
};

interface RegistrationRequestsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegistrationRequestsDialog({
  open,
  onOpenChange,
}: RegistrationRequestsDialogProps) {
  const [requests, setRequests] = React.useState<RegistrationRequest[]>([]);
  const [filter, setFilter] = React.useState("ALL");
  const [loading, setLoading] = React.useState(false);
  const [rejectId, setRejectId] = React.useState<string | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");

  const fetchRequests = React.useCallback(async (status: string) => {
    setLoading(true);
    try {
      const data = await getRegistrationRequests(status);
      setRequests(data as RegistrationRequest[]);
    } catch {
      toast.add({
        title: "Gagal memuat data",
        description: "Terjadi kesalahan saat memuat data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await getRegistrationRequests(filter);
        if (!cancelled) {
          setRequests(data as RegistrationRequest[]);
        }
      } catch {
        if (!cancelled) {
          toast.add({
            title: "Gagal memuat data",
            description: "Terjadi kesalahan saat memuat data",
            type: "error",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [open, filter]);

  const handleApprove = async (id: string) => {
    const result = await approveRegistrationRequest(id);
    if (result?.toast) {
      toast.add(result.toast);
    }
    if (result?.success) {
      fetchRequests(filter);
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    const result = await rejectRegistrationRequest(rejectId, rejectReason);
    if (result?.toast) {
      toast.add(result.toast);
    }
    if (result?.success) {
      setRejectId(null);
      setRejectReason("");
      fetchRequests(filter);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Request Pendaftaran</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <IconFilter className="size-4 text-muted-foreground" />
          <div className="flex gap-1 flex-wrap">
            {["ALL", "PENDING", "APPROVED", "REJECTED", "EXPIRED"].map(
              (status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status)}
                >
                  {status === "ALL" ? "Semua" : STATUS_LABELS[status]}
                </Button>
              ),
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Memuat...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{req.email}</span>
                    <Badge variant={STATUS_VARIANTS[req.status]}>
                      {STATUS_LABELS[req.status]}
                    </Badge>
                  </div>
                  {req.name && (
                    <p className="text-sm text-muted-foreground">{req.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(req.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  {req.reason && (
                    <p className="text-xs text-destructive mt-1">
                      Alasan: {req.reason}
                    </p>
                  )}
                </div>

                {req.status === "PENDING" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <IconDotsVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleApprove(req.id)}>
                        <IconCheck className="size-4" />
                        Setujui
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setRejectId(req.id)}
                      >
                        <IconX className="size-4" />
                        Tolak
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>

      <Dialog open={!!rejectId} onOpenChange={(v) => {
        if (!v) {
          setRejectId(null);
          setRejectReason("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Alasan Penolakan</label>
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Masukkan alasan penolakan..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectId(null);
                  setRejectReason("");
                }}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
              >
                Tolak
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
