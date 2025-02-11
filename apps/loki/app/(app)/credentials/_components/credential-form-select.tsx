"use client";

import { LoadingButton } from "@/components/app/loading-button";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { DbFormVersion } from "@/db/schema/form-versions";
import PageHeader from "@/components/app/page-header";

type Props = {
  formVersions: DbFormVersion[];
  isLoading: boolean;
  className?: string;
  onSubmit: (formVersionId: string) => void;
};

export default function CredentialFormSelect({
  className,
  isLoading,
  formVersions,
  onSubmit,
}: Props) {
  const t = useTranslations("Credential");
  const tGeneric = useTranslations("Generic");
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function handleSubmit() {
    if (!selectedId) {
      return toast.error("FORM_NOT_SELECTED");
    }

    onSubmit(selectedId);
  }

  return (
    <section className={cn("space-y-6 flex-1 flex flex-col", className)}>
      <section className="space-y-6 flex-auto overflow-y-auto h-0 flex flex-col p-12 w-1/2">
        <PageHeader
          title={t("formSelectTitle")}
          subtitle={t("formSelectDescription")}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={isLoading}
            >
              {selectedId
                ? formVersions.find((v) => v.id === selectedId)?.title
                : t("searchForm")}
              {isLoading ? (
                <Loader2 className="animate-spin shrink-0 ml-2" />
              ) : (
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[28rem] p-0">
            <Command>
              <CommandInput placeholder={t("searchFormPlaceholder")} />
              <CommandList>
                <CommandEmpty>{t("searchFormNotFound")}</CommandEmpty>
                <CommandGroup>
                  {formVersions.map((v) => (
                    <CommandItem
                      value={v.title}
                      key={v.id}
                      onSelect={() => {
                        setSelectedId(v.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          v.id === selectedId ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {v.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </section>
      <div className="flex justify-end py-4 px-12 gap-2 border-t">
        <LoadingButton loading={isLoading} type="submit" onClick={handleSubmit}>
          {tGeneric("submit")}
        </LoadingButton>
      </div>
    </section>
  );
}
