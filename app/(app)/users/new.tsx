"use client";

import { CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import UserForm from "./form";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = { children: React.ReactNode };

export default function NewUser({ children }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const action = searchParams.get("action");

  function onOpen() {
    const params = new URLSearchParams(searchParams);
    params.set("action", "new");
    router.push(`${pathname}?${params.toString()}`);
  }

  function onClose() {
    const params = new URLSearchParams(searchParams);
    params.delete("action");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Dialog open={action === "new"} onOpenChange={onClose}>
      <Button onClick={onOpen}>
        <CirclePlus />
        {children}
      </Button>
      <DialogContent>
        <UserForm onSubmit={onClose} />
      </DialogContent>
    </Dialog>
  );
}
