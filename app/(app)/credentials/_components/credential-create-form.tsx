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
import { Clock, FileStack, FileText, QrCode, TextSelect } from "lucide-react";
import { DbCredential } from "@/db/schema/credentials";
import CredentialValidityForm from "./credential-validity-form";
import { DbCredentialRequest } from "@/db/schema/credential-requests";

type Props = {
  formVersions: DbFormVersion[];
};

export default function CredentialCreateForm({ formVersions }: Props) {
  const t = useTranslations("Credential");
  const tStepper = useTranslations("Stepper");
  const [step, setStep] = useState<number>(0);
  const [formVersion, setFormVersion] = useState<DbFormVersion | null>(null);
  const [credential, setCredential] = useState<DbCredential | null>(null);
  const [challengue, setChallengue] = useState<DbCredentialRequest | null>(
    null
  );

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
      title: "challenge",
      icon: QrCode,
    },
    {
      title: "presentations",
      icon: FileStack,
    },
  ];

  return (
    <section className="flex flex-1 border-t">
      <section className="basis-1/4 p-6 flex flex-col">
        <div className="space-y-6 flex-1">
          <GoBackButton variant="ghost" size="sm" />
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
          <Progress value={((step + 1) / items.length) * 100} />
        </div>
      </section>
      <section className="border-l basis-3/4 flex flex-col">
        <FormSelectForm
          className={step === 0 ? "flex" : "hidden"}
          value={formVersion?.id ?? ""}
          options={formVersions}
          onSelect={(selected) => setFormVersion(selected)}
          onSubmit={() => setStep(1)}
        />
        <CredentialContentForm
          className={step === 1 ? "flex" : "hidden"}
          formVersion={formVersion}
          onSubmit={(credential: DbCredential) => {
            setCredential(credential);
            setStep(2);
          }}
          onReset={() => setStep(0)}
        />
        <CredentialValidityForm
          className={step === 2 ? "flex" : "hidden"}
          credential={credential}
          formVersion={formVersion}
          onSubmit={([credential, challengue]: [
            DbCredential,
            DbCredentialRequest
          ]) => {
            setCredential(credential);
            setChallengue(challengue);
            setStep(3);
          }}
          onReset={() => setStep(1)}
        />
      </section>
    </section>
  );
}
