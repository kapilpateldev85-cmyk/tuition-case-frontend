"use client";

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { CaseForm } from "@/components/forms/CaseForm";
import { useCaseDetail, useUpdateCase } from "@/features/cases/hooks";
import { ROUTES } from "@/constants";
import type { EditCaseFormValues } from "@/schemas";

export default function EditCasePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: caseData, isLoading, isError, refetch } = useCaseDetail(id);
  const updateMutation = useUpdateCase(id);

  const onSubmit = async (values: EditCaseFormValues) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateMutation.mutateAsync(values as any);
    router.push(ROUTES.PARENT_CASE_DETAIL(id));
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (isError || !caseData) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="max-w-2xl">
      <Breadcrumbs
        items={[
          { label: "Cases", href: ROUTES.PARENT_CASES },
          { label: caseData.title, href: ROUTES.PARENT_CASE_DETAIL(id) },
          { label: "Edit" },
        ]}
      />
      <PageHeader title="Edit Case" description="Update the details for this case." />
      <Card>
        <CardContent className="pt-6">
          <CaseForm
            defaultValues={{
              title: caseData.title,
              subject: caseData.subject,
              level: caseData.level,
              location: caseData.location,
              budgetPerHour: caseData.budgetPerHour,
              description: caseData.description,
              status: caseData.status as "open" | "matched" | "closed",
            }}
            isEditing={true}
            onSubmit={onSubmit}
            isLoading={updateMutation.isPending}
            submitLabel="Save Changes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
