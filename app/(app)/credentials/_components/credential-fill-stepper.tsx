"use client";

import { DbFormVersion } from "@/db/schema/form-versions";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { GoBackButton } from "@/components/app/go-back-button";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  Calendar,
  Clock,
  FileStack,
  FileText,
  QrCode,
} from "lucide-react";
import { DbCredential } from "@/db/schema/credentials";
import { DbCredentialRequest } from "@/db/schema/credential-requests";
import PageHeader from "@/components/app/page-header";
import CredentialValidityForm from "./credential-validity-form";
import CredentialContentForm from "./credential-content-form";
import Field from "@/components/app/field";
import StatusTag from "@/components/app/status-tag";
import DateDisplay from "@/components/app/date";
import getCredentialStatus from "@/lib/helpers/credential";
import { CREDENTIAL_STATUS_VARIANTS } from "@/lib/constants/credential.const";

type Props = {
  credential: DbCredential;
  formVersion: DbFormVersion;
};

const items = [
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

export default function CredentialFillStepper({
  credential: initCredential,
  formVersion,
}: Props) {
  const t = useTranslations("Credential");
  const tStepper = useTranslations("Stepper");
  const tGeneric = useTranslations("Generic");
  const [step, setStep] = useState<number>(0);
  const [credential, setCredential] = useState<DbCredential>(initCredential);
  const [challengue, setChallengue] = useState<DbCredentialRequest | null>(
    null
  );
  const credentialStatus = getCredentialStatus(credential);

  console.log(challengue);

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
        <div>
          <section className="space-y-4">
            <Field
              icon={<BadgeCheck className="size-4" />}
              label={t("status")}
              className="basis-1/4"
            >
              <StatusTag variant={CREDENTIAL_STATUS_VARIANTS[credentialStatus]}>
                {t(`statuses.${credentialStatus}`)}
              </StatusTag>
            </Field>
            <Field
              icon={<Calendar className="size-4" />}
              label={tGeneric("createdAt")}
              className="basis-1/4"
            >
              <DateDisplay date={formVersion.createdAt} />
            </Field>
            <Field
              icon={<Calendar className="size-4" />}
              label={tGeneric("updatedAt")}
              className="basis-1/4"
            >
              <DateDisplay date={formVersion.updatedAt} />
            </Field>
          </section>
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              {tStepper("step")} {step + 1} {tStepper("of")} {items.length}
            </p>
            <Progress value={((step + 1) / items.length) * 100} />
          </div>
        </div>
      </section>
      <section className="border-l basis-3/4 flex flex-col">
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
