"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { DbFormVersion } from "@/db/schema/form-versions";
import { GoBackButton } from "@/components/app/go-back-button";
import { Clock, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { redirect } from "next/navigation";
import FormContentForm from "../_components/form-content-form";
import FormValidityForm from "../_components/form-validity-form";

export default function FormStepper() {
  const t = useTranslations("FormVersion");
  const tStepper = useTranslations("Stepper");
  const [step, setStep] = useState<number>(0);
  const [formVersion, setFormVersion] = useState<DbFormVersion | null>(null);

  const items = [
    {
      title: "content",
      url: "content",
      icon: FileJson,
    },
    {
      title: "validityTitle",
      url: "validity",
      icon: Clock,
    },
  ];

  return (
    <section className="flex flex-1 border-t">
      <section className="basis-1/4 flex flex-col justify-between p-6 space-y-6">
        <div className="space-y-6">
          <GoBackButton variant="ghost" size="sm" />
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
                disabled={step !== index}
              >
                <item.icon />
                {t(item.title)}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2 w-full">
          <p className="text-muted-foreground text-sm">
            {tStepper("step")} {step + 1} {tStepper("of")} 2
          </p>
          <Progress value={step === 0 ? 50 : 100} />
        </div>
      </section>
      <section className="border-l basis-3/4 flex flex-col">
        <FormContentForm
          className={step === 0 ? "flex" : "hidden"}
          onSubmit={(formVersion: DbFormVersion) => {
            setFormVersion(formVersion);
            setStep(1);
          }}
        />
        <FormValidityForm
          className={step === 1 ? "flex" : "hidden"}
          formVersion={formVersion}
          onReset={() => setStep(0)}
          onSubmit={() => redirect("/forms")}
        />
      </section>
    </section>
  );
}
