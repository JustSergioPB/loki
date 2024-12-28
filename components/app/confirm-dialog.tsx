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
import { LoadingButton } from "@/components/app/loading-button";
import InfoPanel from "./info-panel";

type Props = {
  keyword: string;
  title: string;
  description: string;
  label: string;
  loading: boolean;
  id: number;
  variant: "warning" | "danger";
  onSubmit: () => void;
};

export default function ConfirmDialog({
  title,
  description,
  keyword,
  label,
  loading,
  id,
  variant,
  onSubmit,
}: Props) {
  const tGeneric = useTranslations("Generic");

  const confirmSchema = z.object({
    keyword: z.string().refine((data) => data === keyword, {
      message: "keywordDontMatch",
    }),
  });

  const form = useForm({
    resolver: zodResolver(confirmSchema),
    defaultValues: {
      keyword: "",
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <InfoPanel
        variant={variant}
        label={tGeneric("warning")}
        message={tGeneric("warningMessage")}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          id={id.toString()}
        >
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
    </>
  );
}
