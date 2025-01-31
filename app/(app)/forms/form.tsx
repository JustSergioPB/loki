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
import { Progress } from "@/components/ui/progress";
import { redirect } from "next/navigation";

type Props = {
  value?: DbFormVersion;
  mode?: "create" | "edit";
};

export default function FormForm({ value, mode }: Props) {
  const t = useTranslations("FormVersion");
  const tGeneric = useTranslations("Generic");
  const tStepper = useTranslations("Stepper");
  const [step, setStep] = useState<number>(0);
  const [formVersion, setFormVersion] = useState(value);

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
                if (mode === "create") {
                  setStep(1);
                }
              }}
            />
          )}
          {step === 1 && (
            <ValidityForm
              formVersion={formVersion}
              onSubmit={() => {
                if (mode === "create") {
                  redirect("/forms");
                }
              }}
            />
          )}
        </div>
      </section>
      <section className="basis-2/5 p-6 flex flex-col">
        <div className="space-y-6 flex-1">
          <PageHeader
            title={t(mode === "edit" ? "editTitle" : "createTitle")}
            subtitle={t("createDescription")}
          />
          {formVersion && formVersion.status !== "draft" && (
            <InfoPanel
              variant="warning"
              type="vertical"
              label={tGeneric("warning")}
              message={t("formNotInDraft")}
            />
          )}
          {formVersion && formVersion.types.includes("Bridge") && (
            <InfoPanel
              variant="danger"
              type="vertical"
              label={tGeneric("warning")}
              message={t("dontEditBridge")}
            />
          )}
          <div className="flex flex-col space-y-2">
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
                disabled={mode === "create" && step !== index}
              >
                <item.icon />
                {item.title}
              </Button>
            ))}
          </div>
        </div>
        {mode === "create" && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              {tStepper("step")} {step + 1} {tStepper("of")} 2
            </p>
            <Progress value={step === 0 ? 50 : 100} />
          </div>
        )}
      </section>
    </section>
  );
}
