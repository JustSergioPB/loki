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

type Props = {
  value: string;
  options: DbFormVersion[];
  onSelect: (formVersion: DbFormVersion) => void;
};

export default function SelectForm({ value, options, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Credential");

  return (
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
  );
}
