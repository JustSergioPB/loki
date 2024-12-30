"use client";

import { CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function NewSchema() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Schema");

  return (
    <Button onClick={() => router.push(`${pathname}/new`)}>
      <CirclePlus />
      {t("schema")}
    </Button>
  );
}
