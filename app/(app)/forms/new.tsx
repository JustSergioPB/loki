"use client";

import { CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function NewForm() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Form");

  return (
    <Button onClick={() => router.push(`${pathname}/new`)}>
      <CirclePlus />
      {t("form")}
    </Button>
  );
}
