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

type Props = {
  formVersion?: DbFormVersion;
  onSubmit: (formVersion: DbFormVersion) => void;
};

export default function ContentForm({ formVersion, onSubmit }: Props) {
  const t = useTranslations("Form");
  const tVersion = useTranslations("FormVersion");
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
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
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
              <FormLabel>{tVersion("type")}</FormLabel>
              <FormControl>
                <TagsInput value={field.value} onValueChange={field.onChange} />
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
              <FormLabel>{tVersion("description")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={tVersion("descriptionPlaceholder")}
                  className="resize-none"
                  rows={4}
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
              <FormLabel>{tVersion("content")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={tVersion("contentPlaceholder")}
                  className="resize-none"
                  rows={12}
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <LoadingButton loading={isLoading} type="submit">
            {tGeneric("submit")}
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
