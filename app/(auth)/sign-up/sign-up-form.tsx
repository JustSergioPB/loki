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
import { PasswordInput } from "@/components/ui/password-input";
import { useState } from "react";
import { LoadingButton } from "@/components/app/loading-button";
import { signUpSchema, SignUpSchema } from "@/lib/schemas/sign-up.schema";
import { signUp } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function SignUpForm() {
  const t = useTranslations("SignUp");
  const tUser = useTranslations("User");
  const tOrg = useTranslations("Org");
  const tGeneric = useTranslations("Generic");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      orgName: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignUpSchema) {
    setIsLoading(true);

    const { success, error } = await signUp(values);

    if (success) {
      toast.success(success.message);
      router.push("/hall");
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
            name="fullName"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="name">{tUser("fullName")}</FormLabel>
                <FormControl>
                  <Input
                    id="name"
                    placeholder={tUser("fullNamePlaceholder")}
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
            name="orgName"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="name">{tOrg("org")}</FormLabel>
                <FormControl>
                  <Input
                    id="name"
                    placeholder={tOrg("orgPlaceholder")}
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
                <FormLabel htmlFor="password">{tGeneric("password")}</FormLabel>
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
            {t("register")}
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
