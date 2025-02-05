"use client";

import { LoadingButton } from "@/components/app/loading-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, CirclePlus, Loader2 } from "lucide-react";
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
import { useFormVersions } from "@/lib/hooks/use-form-versions";
import InfoPanel from "@/components/app/info-panel";
import { createCredentialAction } from "@/lib/actions/credential.actions";
import { redirect } from "next/navigation";

type Props = {
  orgId: string;
};

export default function CredentialCreateDialog({ orgId }: Props) {
  const t = useTranslations("Credential");
  const tGeneric = useTranslations("Generic");

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    formVersions,
    error: searchError,
    loading: searchLoading,
    fetchFormVersions,
  } = useFormVersions();

  useEffect(() => {
    fetchFormVersions({ page: 0, pageSize: 500, orgId });
  }, [fetchFormVersions, orgId]);

  async function handleSubmit() {
    if (!selectedId) {
      return toast.error("formNotSelected");
    }

    setLoading(true);

    const { success, error } = await createCredentialAction(selectedId);

    if (success) {
      toast.success(success.message);
      redirect(`/credentials/${success.data.id}/fill`);
    } else {
      toast.error(error.message);
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={(value) => setOpen(value)} modal={false}>
      <DialogTrigger asChild>
        <Button>
          <CirclePlus />
          {t("credential")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>
        <section className="space-y-6">
          {searchError ? (
            <InfoPanel
              variant="danger"
              type="vertical"
              label={t(searchError)}
              message={tGeneric("errors.retryLater")}
            />
          ) : (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={searchLoading || loading}
                >
                  {selectedId
                    ? formVersions.find((v) => v.id === selectedId)?.title
                    : t("searchForm")}
                  {searchLoading || loading ? (
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
                            setPopoverOpen(false);
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
          )}
          <DialogFooter>
            <LoadingButton
              loading={loading}
              type="submit"
              onClick={handleSubmit}
            >
              {tGeneric("submit")}
            </LoadingButton>
          </DialogFooter>
        </section>
      </DialogContent>
    </Dialog>
  );
}
