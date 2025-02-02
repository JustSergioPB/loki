import { LoadingButton } from "@/components/app/loading-button";
import { Button } from "@/components/ui/button";
import { DatetimePicker } from "@/components/ui/datetime-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DbCredentialRequest } from "@/db/schema/credential-requests";
import { DbCredential } from "@/db/schema/credentials";
import { DbFormVersion } from "@/db/schema/form-versions";
import { updateCredentialValidityAction } from "@/lib/actions/credential.actions";
import { validitySchema, ValiditySchema } from "@/lib/schemas/validity.schema";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  credential: DbCredential;
  formVersion: DbFormVersion;
  className?: string;
  onSubmit: (credential: [DbCredential, DbCredentialRequest]) => void;
  onReset: () => void;
};

export default function CredentialValidityForm({
  credential,
  formVersion,
  className,
  onSubmit,
  onReset,
}: Props) {
  const t = useTranslations("FormVersion");
  const tGeneric = useTranslations("Generic");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ValiditySchema>({
    resolver: zodResolver(validitySchema),
    defaultValues: {
      validUntil: formVersion.validFrom ? formVersion.validFrom : undefined,
      validFrom: formVersion.validUntil ? formVersion.validUntil : undefined,
    },
  });

  async function handleSubmit(values: ValiditySchema) {
    setIsLoading(true);

    const { success, error } = await updateCredentialValidityAction(
      credential.id,
      values
    );

    if (success) {
      onSubmit(success.data);
      toast.success(success.message);
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn(className)}
      >
        <section className="space-y-4">
          <p className="font-semibold text-xl leading-none">
            {t("validityTitle")}
          </p>
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="validFrom"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t("validFrom")}</FormLabel>
                  <FormControl>
                    <DatetimePicker
                      {...field}
                      className="w-full"
                      format={[
                        ["days", "months", "years"],
                        ["hours", "minutes", "seconds"],
                      ]}
                      dtOptions={{
                        hour12: false,
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="validUntil"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t("validUntil")}</FormLabel>
                  <FormControl>
                    <DatetimePicker
                      {...field}
                      className="w-full"
                      format={[
                        ["days", "months", "years"],
                        ["hours", "minutes", "seconds"],
                      ]}
                      dtOptions={{
                        hour12: false,
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>
        <section className="flex justify-end gap-2">
          <Button variant="outline" onClick={onReset}>
            {tGeneric("reset")}
          </Button>
          <LoadingButton loading={isLoading} type="submit">
            {tGeneric("submit")}
          </LoadingButton>
        </section>
      </form>
    </Form>
  );
}
