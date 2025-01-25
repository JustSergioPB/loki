"use client";

import { CirclePlus } from "lucide-react";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

type Props = { children: React.ReactNode };

export default function NewCredential({ children }: Props) {
  const pathname = usePathname();

  return (
    <Link href={`${pathname}/new`} className={buttonVariants()}>
      <CirclePlus />
      {children}
    </Link>
  );
}
