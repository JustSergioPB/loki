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
import { PasswordInput } from "@/components/ui/password-input";
import { useState } from "react";
import { LoadingButton } from "@/components/app/loading-button";
import {
  resetPasswordSchema,
  ResetPasswordSchema,
} from "@/lib/schemas/reset-password.schema";
import { useRouter } from "next/navigation";
import { resetUserPasswordAction } from "@/lib/actions/auth.actions";
import { useTranslations } from "next-intl";

export default function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("ResetPassword");
  const tGeneric = useTranslations("Generic");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordSchema) {
    setIsLoading(true);

    const { success, error } = await resetUserPasswordAction(values, token);

    if (success) {
      toast.success(success.message);
      router.push("/login");
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
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="password">
                  {tGeneric("newPassword")}
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    id="password"
                    placeholder="******"
                    autoComplete="new-password"
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="confirmPassword">
                  {tGeneric("confirmPassword")}
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="******"
                    autoComplete="new-password"
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <LoadingButton loading={isLoading} type="submit" className="w-full">
            {t("reset")}
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
