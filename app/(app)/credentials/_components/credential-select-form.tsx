"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  Command,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { DbFormVersion } from "@/db/schema/form-versions";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";

type Props = {
  value: string;
  options: DbFormVersion[];
  className?: string;
  onSelect: (formVersion: DbFormVersion) => void;
  onSubmit: () => void;
};

export default function CredentialSelectForm({
  value,
  options,
  className,
  onSelect,
  onSubmit,
}: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Credential");
  const tFormVersion = useTranslations("Credential");
  const tGeneric = useTranslations("Generic");

  return (
    <section className={cn("flex-1 flex-col", className)}>
      <div className="flex-1 border-b p-12">
        <Label>{tFormVersion("form")}</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between",
                !value && "text-muted-foreground"
              )}
            >
              {value
                ? options.find((formVersion) => formVersion.id === value)?.title
                : t("searchForm")}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0">
            <Command>
              <CommandInput placeholder={t("searchFormPlaceholder")} />
              <CommandList>
                <CommandEmpty>{t("searchFormNotFound")}</CommandEmpty>
                <CommandGroup>
                  {options.map((formVersion) => (
                    <CommandItem
                      value={formVersion.id}
                      key={formVersion.id}
                      onSelect={() => {
                        onSelect(formVersion);
                        setOpen(false);
                      }}
                    >
                      {formVersion.title}
                      <Check
                        className={cn(
                          "ml-auto",
                          formVersion.id === value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex justify-end py-4 px-12">
        <Button type="submit" onClick={onSubmit}>
          {tGeneric("submit")}
        </Button>
      </div>
    </section>
  );
}
