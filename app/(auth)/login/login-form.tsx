"use client";

import Link from "next/link";
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
import { PasswordInput } from "@/components/ui/password-input";
import { useState } from "react";
import { LoadingButton } from "@/components/app/loading-button";
import { loginSchema, LoginSchema } from "@/lib/schemas/login.schema";
import { login } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function LoginForm() {
  const t = useTranslations("Login");
  const tGeneric = useTranslations("Generic");

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginSchema) {
    setIsLoading(true);

    const { success, error } = await login(values);

    if (success) {
      toast.success(success.message);
      router.push(success.data);
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel htmlFor="password">
                    {tGeneric("password")}
                  </FormLabel>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    {t("forgotYourPassword")}
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput
                    id="password"
                    placeholder="******"
                    autoComplete="current-password"
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <LoadingButton loading={isLoading} type="submit" className="w-full">
            {tGeneric("login")}
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
