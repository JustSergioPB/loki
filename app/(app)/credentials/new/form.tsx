"use client";

import { toast } from "sonner";
import { DbFormVersion } from "@/db/schema/form-versions";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { createCredentialRequestAction } from "@/lib/actions/credential-request.actions";
import SelectForm from "./select-form";
import { Label } from "@/components/ui/label";
import { ClaimSchema } from "@/lib/schemas/claim.schema";
import CredentialSchemaForm from "./credential-schema-form";
import { GoBackButton } from "@/components/app/go-back-button";
import PageHeader from "@/components/app/page-header";
import { useRouter } from "next/navigation";

type Props = {
  formVersions: DbFormVersion[];
};

export default function CredentialForm({ formVersions }: Props) {
  const t = useTranslations("Credential");
  const tForm = useTranslations("Form");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormVersion, setSelectedFormVersion] =
    useState<DbFormVersion | null>(null);

  const router = useRouter();

  async function handleSubmit(values: ClaimSchema) {
    if (!selectedFormVersion) {
      toast.error("formNotSelected");
      return;
    }

    setIsLoading(true);

    const { success, error } = await createCredentialRequestAction(
      selectedFormVersion.id,
      values
    );

    if (success) {
      router.push(`/credentials/${success.data}`);
      toast.success(success.message);
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  return (
    <section className="flex flex-1">
      <section className="border-r basis-3/5 flex flex-col">
        <div className="px-6 py-4 border-b">
          <GoBackButton variant="ghost" size="sm" />
        </div>
        <div className="p-6 bg-muted flex-auto overflow-y-auto h-0">
          {selectedFormVersion && (
            <CredentialSchemaForm
              isLoading={isLoading}
              credentialSchema={selectedFormVersion.credentialSchema}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </section>
      <section className="basis-2/5 p-6 space-y-6">
        <PageHeader
          title={t("createTitle")}
          subtitle={t("createDescription")}
        />
        <div className="space-y-2">
          <Label>{tForm("form")}</Label>
          <SelectForm
            value={selectedFormVersion?.id ?? ""}
            options={formVersions}
            onSelect={(formVersion) => setSelectedFormVersion(formVersion)}
          />
        </div>
      </section>
    </section>
  );
}
