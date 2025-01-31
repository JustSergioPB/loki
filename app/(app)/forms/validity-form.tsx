import { toast } from "sonner";
import { DbFormVersion } from "@/db/schema/form-versions";
import { validitySchema, ValiditySchema } from "@/lib/schemas/validity.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTranslations } from "next-intl";
import { DatetimePicker } from "@/components/ui/datetime-picker";
import { LoadingButton } from "@/components/app/loading-button";
import { useState } from "react";
import { updateFormVersionValidityAction } from "@/lib/actions/form-version.actions";

type Props = { formVersion?: DbFormVersion; onSubmit: () => void };

export default function ValidityForm({ formVersion, onSubmit }: Props) {
  const tVersion = useTranslations("FormVersion");
  const tGeneric = useTranslations("Generic");

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ValiditySchema>({
    resolver: zodResolver(validitySchema),
    defaultValues: {
      validFrom: formVersion?.validFrom
        ? new Date(formVersion.validFrom)
        : undefined,
      validUntil: formVersion?.validUntil
        ? new Date(formVersion.validUntil)
        : undefined,
    },
  });

  async function handleSubmit(values: ValiditySchema) {
    setIsLoading(true);

    if (!formVersion) {
      throw new Error("This cant be");
    }

    const { success, error } = await updateFormVersionValidityAction(
      formVersion.id,
      values
    );

    if (success) {
      toast.success(success.message);
      onSubmit();
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="flex justify-between">
          <FormField
            control={form.control}
            name="validFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tVersion("validFrom")}</FormLabel>
                <FormControl>
                  <DatetimePicker
                    {...field}
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
              <FormItem>
                <FormLabel>{tVersion("validUntil")}</FormLabel>
                <FormControl>
                  <DatetimePicker
                    {...field}
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
        <div className="flex justify-end">
          <LoadingButton loading={isLoading} type="submit">
            {tGeneric("submit")}
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
