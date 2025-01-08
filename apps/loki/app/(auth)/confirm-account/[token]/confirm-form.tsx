"use client";

import { toast } from "sonner";
import { useState } from "react";
import { LoadingButton } from "@/components/app/loading-button";
import { confirmAccount } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  confirmAccountSchema,
  ConfirmAccountSchema,
} from "@/lib/schemas/confirm-account.schema";
import { Input } from "@/components/ui/input";

export default function ConfirmForm({ token }: { token: string }) {
  const t = useTranslations("User");
  const tGeneric = useTranslations("Generic");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<ConfirmAccountSchema>({
    resolver: zodResolver(confirmAccountSchema),
    defaultValues: {
      position: "",
    },
  });

  async function onSubmit(values: ConfirmAccountSchema) {
    setIsLoading(true);

    const { success, error } = await confirmAccount(values, token);

    if (success) {
      toast.success(success.message);
      router.push("/onboarding");
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
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("position")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("positionPlaceholder")}
                    type="text"
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <LoadingButton loading={isLoading} type="submit" className="w-full">
            {tGeneric("confirm")}
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
