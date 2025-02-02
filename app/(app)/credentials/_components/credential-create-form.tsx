"use client";

import { DbFormVersion } from "@/db/schema/form-versions";
import { useTranslations } from "next-intl";
import { useState } from "react";
import FormSelectForm from "./credential-select-form";
import CredentialContentForm from "./credential-content-form";
import { GoBackButton } from "@/components/app/go-back-button";
import PageHeader from "@/components/app/page-header";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock, FileStack, FileText, TextSelect } from "lucide-react";
import { DbCredential } from "@/db/schema/credentials";
import CredentialValidityForm from "./credential-validity-form";

type Props = {
  formVersions: DbFormVersion[];
};

export default function CredentialCreateForm({ formVersions }: Props) {
  const t = useTranslations("Credential");
  const tStepper = useTranslations("Stepper");
  const [step, setStep] = useState<number>(0);
  const [formVersion, setFormVersion] = useState<DbFormVersion | null>(null);
  const [credential, setCredential] = useState<DbCredential | null>(null);

  const items = [
    {
      title: "form",
      icon: TextSelect,
    },
    {
      title: "credential",
      icon: FileText,
    },
    {
      title: "validity",
      icon: Clock,
    },
    {
      title: "presentations",
      icon: FileStack,
    },
  ];

  const percentages = [25, 50, 75, 100];

  return (
    <section className="flex flex-1">
      <section className="border-r basis-3/5 flex flex-col">
        <div className="px-12 py-4 border-b">
          <GoBackButton variant="ghost" size="sm" />
        </div>
        {step === 0 && (
          <FormSelectForm
            value={formVersion?.id ?? ""}
            options={formVersions}
            onSelect={(selected) => setFormVersion(selected)}
            onSubmit={() => setStep(1)}
          />
        )}
        {step === 1 && formVersion && (
          <CredentialContentForm
            formVersion={formVersion}
            onSubmit={(credential: DbCredential) => {
              setCredential(credential);
              setStep(2);
            }}
          />
        )}
        {step === 2 && formVersion && credential && (
          <CredentialValidityForm
            credential={credential}
            formVersion={formVersion}
            onSubmit={(credential: DbCredential) => {
              setCredential(credential);
              setStep(3);
            }}
          />
        )}
      </section>
      <section className="basis-2/5 p-6 flex flex-col">
        <div className="space-y-6 flex-1">
          <PageHeader
            title={t("createTitle")}
            subtitle={t("createDescription")}
          />
          <div className="flex flex-col space-y-2">
            {items.map((item, index) => (
              <Button
                key={item.title}
                className={cn(
                  "justify-start",
                  index === step
                    ? "bg-muted hover:bg-muted"
                    : "hover:bg-transparent hover:underline"
                )}
                variant="ghost"
                onClick={() => setStep(index)}
                disabled={step !== index}
              >
                <item.icon />
                {t(item.title)}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            {tStepper("step")} {step + 1} {tStepper("of")} {items.length}
          </p>
          <Progress value={percentages[step]} />
        </div>
      </section>
    </section>
  );
}
