"use client";

import { GoBackButton } from "@/components/app/go-back-button";
import InfoPanel from "@/components/app/info-panel";
import { useTranslations } from "next-intl";
import FormTabs from "./form-tabs";
import { DbFormVersion } from "@/db/schema/form-versions";
import { useSearchParams } from "next/navigation";
import FormContentForm from "./form-content-form";
import FormValidityForm from "./form-validity-form";

type Props = {
  formVersion: DbFormVersion;
};

export default function FormEditForm({ formVersion }: Props) {
  const t = useTranslations("FormVersion");
  const tGeneric = useTranslations("Generic");
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "content";
  const disabled = formVersion.status !== "draft";

  return (
    <section className="flex flex-1">
      <section className="border-r basis-3/5 flex flex-col">
        <div className="px-6 py-4 border-b">
          <GoBackButton variant="ghost" size="sm" href="/forms" />
        </div>
        <div className="p-6">
          {activeTab === "content" && (
            <FormContentForm
              formVersion={formVersion}
              disabled={disabled}
              onSubmit={() => {}}
            />
          )}
          {activeTab === "validity" && (
            <FormValidityForm
              formVersion={formVersion}
              disabled={disabled}
              onSubmit={() => {}}
            />
          )}
        </div>
      </section>
      <section className="basis-2/5 p-6">
        {formVersion.types.includes("Bridge") && (
          <InfoPanel
            variant="danger"
            type="vertical"
            label={tGeneric("warning")}
            message={t("dontEditBridge")}
          />
        )}
        <FormTabs />
      </section>
    </section>
  );
}
