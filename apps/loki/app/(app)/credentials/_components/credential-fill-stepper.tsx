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

type CredentialView = Omit<DbCredential, "formVersion" | "challenge"> & {
  formVersion: DbFormVersion;
  challenge: DbChallenge;
  presentations: DbPresentation[];
};

type Props = {
  credential: CredentialView;
};

const items = [
  {
    title: "present",
    icon: QrCode,
  },
  {
    title: "fill",
    icon: FileText,
  },
  {
    title: "setValidity",
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
  const [step, setStep] = useState<number>(getStep(credentialState));

  useEffect(() => {
    const newStep = getStep(credential);
    setStep(newStep);
  }, [credential]);

  function getStep(credential: CredentialView): number {
    let step = 0;

    console.log(credential);

    if (!credential.challenge.code) step = 1;
    if (credential.claims) step = 2;
    if (credential.isFilled) step = 3;
    if (credential.credential && credential.challenge.code) step = 4;

    return step;
  }

  async function updateClaims(values: object) {
    setIsLoading(true);

    const { success, error } = await updateCredentialAction(credential.id, {
      claims: values,
    });

    setIsLoading(false);

    if (success) {
      setCredential({ ...credential, claims: success.data.claims });
      toast.success(success.message);
    } else {
      toast.error(error.message);
    }
  }

  async function updateValidity(values: ValiditySchema) {
    setIsLoading(true);

    const { success, error } = await updateCredentialAction(credential.id, {
      validFrom: values.validFrom,
      validUntil: values.validUntil,
      isFilled: true,
    });

    setIsLoading(false);

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
  }

  async function sign() {
    setIsLoading(true);

    const { success, error } = await signCredentialAction(credential.id);

    setIsLoading(false);

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
          <ChallengeDetails credential={credential} />
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
