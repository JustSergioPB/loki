"use client";

import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { LoadingButton } from "@/components/app/loading-button";
import { removeOrg } from "@/lib/actions/org.actions";
import { toast } from "sonner";
import { Org } from "@/db/schema/orgs";

type Props = {
  org: Org;
  onSubmit: () => void;
};

export default function OrgDelete({ org, onSubmit }: Props) {
  const t = useTranslations("Org");
  const tGeneric = useTranslations("Generic");
  const [isLoading, setIsLoading] = useState(false);

  const deleteForm = z.object({
    fullName: z.string().refine((data) => data === org.name, {
      message: "orgFullNameDontMatch",
    }),
  });

  const form = useForm({
    resolver: zodResolver(deleteForm),
    defaultValues: {
      fullName: "",
    },
  });

  async function handleSubmit() {
    setIsLoading(true);

    const { success, error } = await removeOrg(org.id);

    if (success) {
      toast.success(success.message);
      onSubmit();
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("deleteTitle")}</DialogTitle>
        <DialogDescription>{t("deleteDescription")}</DialogDescription>
      </DialogHeader>
      <p className="p-2 bg-red-100 rounded-md text-sm inline-flex items-center gap-1 text-red-500">
        <TriangleAlert className="size-4" />
        <span className="font-bold">{tGeneric("warning")}.</span>
        {tGeneric("warningMessage")}
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
          id={org ? `org-form-${org.id}` : "new"}
        >
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("deleteLabel")}{" "}
                  <span className="font-bold">{org.name}</span>
                </FormLabel>
                <FormControl>
                  <Input type="text" required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <LoadingButton loading={isLoading} type="submit">
              {tGeneric("submit")}
            </LoadingButton>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
