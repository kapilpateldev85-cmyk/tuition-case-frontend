"use client";

import { useState } from "react";
import { UserCheck, UserPlus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { useTutors } from "@/features/tutors/hooks";
import { useInviteTutor } from "@/features/cases/hooks";
import { getInitials } from "@/utils";

interface InviteTutorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: string;
  alreadyInvitedIds: string[];
}

/**
 * InviteTutorDialog — search the tutor directory and invite by clicking.
 */
export function InviteTutorDialog({
  open,
  onOpenChange,
  caseId,
  alreadyInvitedIds,
}: InviteTutorDialogProps) {
  const [search, setSearch] = useState("");
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const { data, isLoading } = useTutors({ search, pageSize: 10 });
  const inviteMutation = useInviteTutor(caseId);

  const handleInvite = async (tutorId: string) => {
    setInvitingId(tutorId);
    try {
      await inviteMutation.mutateAsync(tutorId);
    } finally {
      setInvitingId(null);
    }
  };

  const tutors = data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" id="invite-tutor-dialog">
        <DialogHeader>
          <DialogTitle>Invite a Tutor</DialogTitle>
          <DialogDescription>
            Search for a tutor and click Invite to add them to this case.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search tutors by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            id="invite-tutor-search"
          />
        </div>

        <div className="max-h-72 overflow-y-auto space-y-1">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))
          ) : tutors.length === 0 ? (
            <EmptyState
              title="No tutors found"
              description="Try a different name."
              className="py-6"
            />
          ) : (
            tutors.map((profile) => {
              const isInvited = alreadyInvitedIds.includes(profile.id);
              return (
                <div
                  key={profile.id}
                  className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-slate-50 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-slate-200">
                      {getInitials(profile.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {profile.displayName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {profile.qualifications[0]?.degree ?? "No qualifications listed"}
                    </p>
                  </div>
                  {isInvited ? (
                    <Badge variant="success" className="gap-1 shrink-0">
                      <UserCheck className="h-3 w-3" />
                      Invited
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 h-7 px-2 text-xs"
                      disabled={invitingId === profile.id}
                      onClick={() => handleInvite(profile.id)}
                      id={`invite-${profile.id}`}
                    >
                      <UserPlus className="h-3.5 w-3.5 mr-1" />
                      {invitingId === profile.id ? "Inviting..." : "Invite"}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
