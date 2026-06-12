import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { caseService } from "@/services/case.service";
import { useCurrentUser } from "@/features/auth/AuthProvider";
import { QUERY_KEYS } from "@/constants";
import type {
  CaseFilters,
  CreateCasePayload,
  UpdateCasePayload,
} from "@/types";

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Query: paginated, filtered list of cases for the current user.
 */
export function useCases(filters: CaseFilters) {
  const user = useCurrentUser();

  return useQuery({
    queryKey: QUERY_KEYS.cases.list(filters),
    queryFn: () => caseService.list(filters, user.id, user.role),
  });
}

/**
 * Query: single case by ID.
 */
export function useCaseDetail(id: string) {
  const user = useCurrentUser();

  return useQuery({
    queryKey: QUERY_KEYS.cases.detail(id),
    queryFn: () => caseService.getById(id, user.id, user.role),
    enabled: !!id,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Mutation: create a new case.
 */
export function useCreateCase() {
  const user = useCurrentUser();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCasePayload) =>
      caseService.create(payload, user.id, user.name, user.email),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.cases.all });
      toast.success("Case created successfully");
    },
    onError: (err: { message: string }) => {
      toast.error(err.message ?? "Failed to create case");
    },
  });
}

/**
 * Mutation: update an existing case.
 */
export function useUpdateCase(caseId: string) {
  const user = useCurrentUser();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCasePayload) =>
      caseService.update(caseId, payload, user.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.cases.all });
      toast.success("Case updated successfully");
    },
    onError: (err: { message: string }) => {
      toast.error(err.message ?? "Failed to update case");
    },
  });
}

/**
 * Mutation: delete a case.
 */
export function useDeleteCase() {
  const user = useCurrentUser();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (caseId: string) => caseService.delete(caseId, user.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.cases.all });
      toast.success("Case deleted");
    },
    onError: (err: { message: string }) => {
      toast.error(err.message ?? "Failed to delete case");
    },
  });
}

/**
 * Mutation: invite a tutor to a case.
 */
export function useInviteTutor(caseId: string) {
  const user = useCurrentUser();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (tutorId: string) =>
      caseService.inviteTutor(caseId, tutorId, user.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.cases.detail(caseId) });
      toast.success("Tutor invited successfully");
    },
    onError: (err: { message: string }) => {
      toast.error(err.message ?? "Failed to invite tutor");
    },
  });
}

/**
 * Mutation: revoke a tutor's invitation.
 */
export function useRevokeInvitation(caseId: string) {
  const user = useCurrentUser();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (tutorId: string) =>
      caseService.revokeInvitation(caseId, tutorId, user.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.cases.detail(caseId) });
      toast.success("Invitation revoked");
    },
    onError: (err: { message: string }) => {
      toast.error(err.message ?? "Failed to revoke invitation");
    },
  });
}
