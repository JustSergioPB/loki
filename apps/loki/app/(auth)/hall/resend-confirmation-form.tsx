"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/app/loading-button";
import { resendUserConfirmationAction } from "@/lib/actions/auth.actions";
import { emailSchema, EmailSchema } from "@/lib/schemas/email.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ResendConfirmationForm() {
  const t = useTranslations("ConfirmAccount");
  const tGeneric = useTranslations("Generic");
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<EmailSchema>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: EmailSchema) {
    setIsLoading(true);
    const { success, error } = await resendUserConfirmationAction(values);

    if (success) {
      toast.success(success.message);
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="email">{tGeneric("email")}</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    placeholder={tGeneric("emailPlaceholder")}
                    type="email"
                    autoComplete="email"
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <LoadingButton loading={isLoading} type="submit" className="w-full">
            {t("sendLink")}
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
