"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React from "react";

const GoBackButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { href?: string }
>((props, ref) => {
  const router = useRouter();
  const t = useTranslations("Generic");

  return (
    <Button
      {...props}
      ref={ref}
      onClick={() => (props.href ? router.push(props.href) : router.back())}
    >
      <ArrowLeft className="size-4" />
      {t("goBack")}
    </Button>
  );
});

GoBackButton.displayName = "GoBackButton";

export { GoBackButton };
