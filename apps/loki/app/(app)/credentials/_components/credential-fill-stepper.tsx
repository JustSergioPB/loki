"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { GoBackButton } from "@/components/app/go-back-button";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock, FileText, PenTool, QrCode } from "lucide-react";
import { DbCredential } from "@/db/schema/credentials";
import PageHeader from "@/components/app/page-header";
import CredentialValidityForm from "./credential-validity-form";
import ChallengeDetails from "./credential-challenge-details";
import { toast } from "sonner";
import {
  signCredentialAction,
  updateCredentialAction,
} from "@/lib/actions/credential.actions";
import { DbFormVersion } from "@/db/schema/form-versions";
import { DbChallenge } from "@/db/schema/challenges";
import { ValiditySchema } from "@/lib/schemas/validity.schema";
import CredentialClaimsForm from "./credential-claims-form";
import { DbPresentation } from "@/db/schema/presentations";
import { LoadingButton } from "@/components/app/loading-button";

type Props = {
  credential: Omit<DbCredential, "formVersion" | "challenge"> & {
    formVersion: DbFormVersion;
    challenge: DbChallenge;
    presentations: DbPresentation[];
  };
};

const items = [
  {
    title: "present",
    icon: QrCode,
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
    title: "sign",
    icon: PenTool,
  },
  {
    title: "claim",
    icon: QrCode,
  },
];

export default function CredentialFillStepper({
  credential: credentialState,
}: Props) {
  const t = useTranslations("Credential");
  const tStepper = useTranslations("Stepper");
  const tGeneric = useTranslations("Generic");
  const [credential, setCredential] = useState(credentialState);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    let step = 3;

    if (!credential.credential && credential.challenge.code) step = 0;
    if (!credential.challenge.code) step = 1;
    if (credential.claims) step = 2;
    if (credential.credential && credential.challenge.code) step = 4;

    setStep(step);
  }, [credential]);

  async function updateClaims(values: object) {
    setIsLoading(true);

    const { success, error } = await updateCredentialAction(credential.id, {
      claims: values,
    });

    if (success) {
      setCredential({ ...credential, claims: success.data.claims });
      toast.success(success.message);
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  async function updateValidity(values: ValiditySchema) {
    setIsLoading(true);

    const { success, error } = await updateCredentialAction(credential.id, {
      validFrom: values.validFrom,
      validUntil: values.validUntil,
    });

    if (success) {
      setCredential({
        ...credential,
        validFrom: success.data.validFrom,
        validUntil: success.data.validUntil,
      });
      toast.success(success.message);
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  async function sign() {
    setIsLoading(true);

    const { success, error } = await signCredentialAction(credential.id);

    if (success) {
      if (!success.data.challenge) {
        return toast.error("MISSING_CHALLENGE");
      }

      setCredential({
        ...credential,
        credential: success.data.credential,
        challenge: success.data.challenge,
      });
      toast.success(success.message);
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

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
        {(step === 0 || step === 4) && (
          <ChallengeDetails challenge={credential.challenge} />
        )}
        {step === 1 && (
          <CredentialClaimsForm
            claims={credential.claims}
            formVersion={credential.formVersion}
            onSubmit={updateClaims}
          />
        )}
        {step === 2 && (
          <CredentialValidityForm
            validFrom={credential.validFrom}
            validUntil={credential.validUntil}
            formVersion={credential.formVersion}
            isLoading={isLoading}
            onSubmit={updateValidity}
          />
        )}
        {step === 3 && (
          <section className="flex-1 flex flex-col">
            <pre className="flex-auto overflow-y-auto h-0 flex flex-col p-12 border-b">
              <code>{JSON.stringify(credential.claims, null, 1)}</code>
            </pre>
            <div className="flex justify-end py-4 px-12 gap-2">
              <LoadingButton loading={isLoading} type="submit" onClick={sign}>
                {tGeneric("submit")}
              </LoadingButton>
            </div>
          </section>
        )}
      </section>
    </section>
  );
}
