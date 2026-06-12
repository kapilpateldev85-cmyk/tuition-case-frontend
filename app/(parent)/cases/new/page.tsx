"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { CaseForm } from "@/components/forms/CaseForm";
import { useCreateCase } from "@/features/cases/hooks";
import { ROUTES } from "@/constants";
import type { CreateCaseFormValues } from "@/schemas";

export default function NewCasePage() {
  const router = useRouter();
  const createMutation = useCreateCase();

  const onSubmit = async (values: CreateCaseFormValues) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created = await createMutation.mutateAsync(values as any);
    router.push(ROUTES.PARENT_CASE_DETAIL(created.id));
  };

  return (
    <div className="max-w-2xl">
      <Breadcrumbs items={[{ label: "Cases", href: ROUTES.PARENT_CASES }, { label: "New Case" }]} />
      <PageHeader
        title="Post a New Case"
        description="Describe what you're looking for in a tutor."
      />
      <Card>
        <CardContent className="pt-6">
          <CaseForm
            onSubmit={onSubmit}
            isLoading={createMutation.isPending}
            submitLabel="Post Case"
          />
        </CardContent>
      </Card>
    </div>
  );
}
