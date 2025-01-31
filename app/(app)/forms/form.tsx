"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import InfoPanel from "@/components/app/info-panel";
import PageHeader from "@/components/app/page-header";
import { DbFormVersion } from "@/db/schema/form-versions";
import { GoBackButton } from "@/components/app/go-back-button";
import { Clock, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContentForm from "./content-form";
import ValidityForm from "./validity-form";
import { cn } from "@/lib/utils";

type Props = {
  value?: DbFormVersion;
  mode?: "new" | "edit";
};

export default function FormForm({ value, mode }: Props) {
  const t = useTranslations("Form");
  const tVersion = useTranslations("FormVersion");
  const [step, setStep] = useState<number>(0);
  const [formVersion, setFormVersion] = useState(value);
  const tGeneric = useTranslations("Generic");

  const items = [
    {
      title: "Content",
      url: "/content",
      icon: FileJson,
    },
    {
      title: "Validity",
      url: "/validity",
      icon: Clock,
    },
  ];

  return (
    <section className="flex flex-1">
      <section className="border-r basis-3/5 flex flex-col">
        <div className="px-6 py-4 border-b">
          <GoBackButton variant="ghost" size="sm" />
        </div>
        <div className="p-6">
          {step === 0 && (
            <ContentForm
              formVersion={formVersion}
              onSubmit={(formVersion: DbFormVersion) => {
                setFormVersion(formVersion);
                setStep(1);
              }}
            />
          )}
          {step === 1 && (
            <ValidityForm
              formVersion={formVersion}
              onSubmit={() => setStep(2)}
            />
          )}
        </div>
      </section>
      <section className="basis-2/5 p-6 flex flex-col">
        <div className="space-y-6">
          <PageHeader
            title={t(formVersion ? "editTitle" : "createTitle")}
            subtitle={t(formVersion ? "editDescription" : "createDescription")}
          />
          {formVersion && formVersion.status !== "draft" && (
            <InfoPanel
              variant="warning"
              type="vertical"
              label={tGeneric("warning")}
              message={tVersion("formNotInDraft")}
            />
          )}
          {formVersion && formVersion.types.includes("Bridge") && (
            <InfoPanel
              variant="danger"
              type="vertical"
              label={tGeneric("warning")}
              message={tVersion("dontEditBridge")}
            />
          )}
          <div className="flex space-x-2 lg:flex-col lg:space-x-0 space-y-2">
            {items.map((item, index) => (
              <Button
                key={item.url}
                className={cn(
                  "justify-start",
                  index === step
                    ? "bg-muted hover:bg-muted"
                    : "hover:bg-transparent hover:underline"
                )}
                variant="ghost"
                onClick={() => setStep(index)}
                disabled={mode === "new" && step !== index}
              >
                <item.icon />
                {item.title}
              </Button>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
