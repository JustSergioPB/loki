"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { LoadingButton } from "@/components/app/loading-button";
import { emailSchema, EmailSchema } from "@/lib/schemas/email.schema";
import { forgotPassword } from "@/lib/actions/auth.actions";
import { useTranslations } from "next-intl";

export default function ForgotPasswordForm() {
  const t = useTranslations("ForgotPassword");
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

    const { success, error } = await forgotPassword(values.email);

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
