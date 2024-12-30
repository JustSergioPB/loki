"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addressSchema, AddressSchema } from "@/lib/schemas/address.schema";
import { LoadingButton } from "@/components/app/loading-button";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addAddressToOrg } from "@/lib/actions/org.actions";

export default function AddressForm() {
  const t = useTranslations("Address");
  const tGeneric = useTranslations("Generic");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<AddressSchema>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: "",
      stateProvince: "",
      location: "",
    },
  });

  async function onSubmit(values: AddressSchema) {
    setIsLoading(true);

    const { success, error } = await addAddressToOrg(values);

    if (success) {
      toast.success(success.message);
      router.push("/verifying");
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl mx-auto py-10"
      >
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("country")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("countryPlaceholder")}
                  type="text"
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
          name="stateProvince"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("stateProvince")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("stateProvincePlaceholder")}
                  type="text"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("location")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("locationPlaceholder")}
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton loading={isLoading} type="submit" className="w-full">
          {tGeneric("submit")}
        </LoadingButton>
      </form>
    </Form>
  );
}
