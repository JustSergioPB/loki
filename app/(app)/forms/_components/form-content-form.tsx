import { toast } from "sonner";
import { DbFormVersion } from "@/db/schema/form-versions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { formSchema, FormSchema } from "@/lib/schemas/form.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  createFormVersionAction,
  updateFormVersionContentAction,
} from "@/lib/actions/form-version.actions";
import { useTranslations } from "next-intl";
import { LoadingButton } from "@/components/app/loading-button";
import { Textarea } from "@/components/ui/textarea";
import { TagsInput } from "@/components/ui/tags-input";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/app/page-header";

type Props = {
  formVersion?: DbFormVersion;
  disabled?: boolean;
  className?: string;
  onSubmit: (formVersion: DbFormVersion) => void;
};

export default function FormContentForm({
  formVersion,
  onSubmit,
  disabled,
  className,
}: Props) {
  const t = useTranslations("FormVersion");
  const tGeneric = useTranslations("Generic");

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: formVersion?.title ?? "",
      types: formVersion?.types ?? [],
      description: formVersion?.description ?? "",
      credentialSubject: JSON.stringify(
        formVersion?.credentialSubject ?? {},
        null,
        1
      ),
    },
  });

  async function handleSubmit(values: FormSchema) {
    setIsLoading(true);

    const { success, error } = formVersion
      ? await updateFormVersionContentAction(formVersion.id, values)
      : await createFormVersionAction(values);

    if (success) {
      toast.success(success.message);
      onSubmit(success.data);
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("flex-1 flex-col", className)}
      >
        <section className="space-y-6 flex-auto overflow-y-auto h-0 p-12">
          <PageHeader
            title={t("createTitle")}
            subtitle={t("createDescription")}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("titleProp")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("titlePlaceholder")}
                    type="text"
                    required
                    disabled={disabled}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="types"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("type")}</FormLabel>
                <FormControl>
                  <TagsInput
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("description")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("descriptionPlaceholder")}
                    className="resize-none"
                    rows={4}
                    disabled={disabled}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="credentialSubject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("content")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("contentPlaceholder")}
                    className="resize-none"
                    rows={18}
                    required
                    disabled={disabled}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>
        <div className="flex justify-end px-12 py-4 bg-card border-t">
          <LoadingButton loading={isLoading} type="submit" disabled={disabled}>
            {tGeneric("submit")}
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
