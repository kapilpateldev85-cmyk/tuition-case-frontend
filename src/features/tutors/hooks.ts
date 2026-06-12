import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tutorService } from "@/services/tutor.service";
import { caseService } from "@/services/case.service";
import { useCurrentUser } from "@/features/auth/AuthProvider";
import { QUERY_KEYS } from "@/constants";
import type { TutorProfileFilters } from "@/types";
import type { TutorProfileFormValues } from "@/schemas";

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Query: paginated list of tutor profiles (for parent directory).
 */
export function useTutors(filters: TutorProfileFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.tutors.list(filters),
    queryFn: () => tutorService.list(filters),
  });
}

/**
 * Query: a specific tutor's public profile.
 */
export function useTutorProfile(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.tutors.profile(userId),
    queryFn: () => tutorService.getProfile(userId),
    enabled: !!userId,
    retry: (failureCount, error: { statusCode?: number }) => {
      if (error.statusCode === 404) return false;
      return failureCount < 1;
    },
  });
}

/**
 * Query: the currently logged-in tutor's own profile.
 */
export function useMyTutorProfile() {
  const user = useCurrentUser();

  return useQuery({
    queryKey: QUERY_KEYS.tutors.myProfile,
    queryFn: () => tutorService.getMyProfile(user.id),
    enabled: user.role === "tutor",
  });
}

/**
 * Query: invitations for the logged-in tutor.
 */
export function useMyInvitations() {
  const user = useCurrentUser();

  return useQuery({
    queryKey: QUERY_KEYS.tutors.invitations,
    queryFn: () => tutorService.getMyInvitations(user.id),
    enabled: user.role === "tutor",
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Mutation: create tutor profile.
 */
export function useCreateTutorProfile() {
  const user = useCurrentUser();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: TutorProfileFormValues) =>
      tutorService.createProfile(user.id, user.name, user.email, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tutors.myProfile });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tutors.all });
      toast.success("Profile created successfully");
    },
    onError: (err: { message: string }) => {
      toast.error(err.message ?? "Failed to create profile");
    },
  });
}

/**
 * Mutation: accept or decline a case invitation.
 */
export function useRespondToInvitation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      invitationId,
      status,
    }: {
      invitationId: string;
      status: "accepted" | "declined";
    }) => caseService.respondToInvitation(invitationId, status),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tutors.invitations });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.cases.all });
      toast.success(
        status === "accepted" ? "Invitation accepted" : "Invitation declined"
      );
    },
    onError: (err: { message: string }) => {
      toast.error(err.message ?? "Failed to update invitation");
    },
  });
}

/**
 * Mutation: update tutor profile.
 */
export function useUpdateTutorProfile() {
  const user = useCurrentUser();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<TutorProfileFormValues>) =>
      tutorService.updateProfile(user.id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tutors.myProfile });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tutors.all });
      toast.success("Profile updated successfully");
    },
    onError: (err: { message: string }) => {
      toast.error(err.message ?? "Failed to update profile");
    },
  });
}
