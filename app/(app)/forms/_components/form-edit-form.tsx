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
    <section className="flex flex-1 border-t">
      <section className="basis-1/4 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <GoBackButton variant="ghost" size="sm" href="/forms" />
          <FormTabs />
        </div>
        {formVersion.types.includes("Bridge") && (
          <InfoPanel
            variant="danger"
            type="vertical"
            label={tGeneric("warning")}
            message={t("dontEditBridge")}
          />
        )}
      </section>
      <section className="border-l basis-3/4 flex flex-col">
        <FormContentForm
          className={activeTab === "content" ? "flex" : "hidden"}
          formVersion={formVersion}
          disabled={disabled}
          onSubmit={() => {}}
        />
        <FormValidityForm
          className={activeTab === "validity" ? "flex" : "hidden"}
          formVersion={formVersion}
          disabled={disabled}
          onSubmit={() => {}}
          onReset={() => {}}
        />
      </section>
    </section>
  );
}
