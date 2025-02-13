"use client";

import { DialogFooter } from "@/components/ui/dialog";
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
import { LoadingButton } from "@/components/app/loading-button";
import InfoPanel from "./info-panel";
import { cn } from "@/lib/utils";

type Props = {
  keyword: string;
  label: string;
  loading: boolean;
  id: string;
  variant: "warning" | "danger";
  className?: string;
  onSubmit: () => void;
};

export default function ConfirmDialog({
  keyword,
  label,
  loading,
  id,
  variant,
  onSubmit,
  className,
}: Props) {
  const tGeneric = useTranslations("Generic");

  const confirmForm = z.object({
    keyword: z.string().refine((data) => data === keyword, {
      message: "keywordDontMatch",
    }),
  });

  const form = useForm({
    resolver: zodResolver(confirmForm),
    defaultValues: {
      keyword: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-6", className)}
        id={id.toString()}
      >
        <InfoPanel
          variant={variant}
          label={tGeneric("warning")}
          message={tGeneric("warningMessage")}
          className="w-full"
        />
        <FormField
          control={form.control}
          name="keyword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {label} <span className="font-bold">{keyword}</span>
              </FormLabel>
              <FormControl>
                <Input type="text" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <LoadingButton loading={loading} type="submit">
            {tGeneric("submit")}
          </LoadingButton>
        </DialogFooter>
      </form>
    </Form>
  );
}
