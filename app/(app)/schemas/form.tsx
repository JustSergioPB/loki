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
import { useTranslations } from "next-intl";
import {
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SchemaSchema, schemaSchema } from "@/lib/schemas/schema.schema";
import { createSchema, updateSchema } from "@/lib/actions/schema.actions";
import { useState } from "react";
import { LoadingButton } from "@/components/app/loading-button";
import { SchemaWithVersions } from "@/db/schema/schemas";
import { Schema } from "@/lib/models/schema";
import { Textarea } from "@/components/ui/textarea";
import InfoPanel from "@/components/app/info-panel";

type Props = {
  schema?: SchemaWithVersions;
  onSubmit: () => void;
};

export default function SchemaForm({ schema, onSubmit }: Props) {
  const t = useTranslations("Schema");
  const tVersion = useTranslations("SchemaVersion");
  const tGeneric = useTranslations("Generic");
  const [isLoading, setIsLoading] = useState(false);
  const latestVersion = schema
    ? Schema.fromProps(schema).getLatestVersion()
    : undefined;

  const form = useForm<SchemaSchema>({
    resolver: zodResolver(schemaSchema),
    defaultValues: {
      title: schema?.title ?? "",
      description: latestVersion?.description ?? "",
      content: JSON.stringify(latestVersion?.credentialSubject, null, 1) ?? "",
    },
  });

  async function handleSubmit(values: SchemaSchema) {
    setIsLoading(true);

    const { success, error } = schema
      ? await updateSchema(schema.id, values)
      : await createSchema(values);

    if (success) {
      toast.success(success.message);
      onSubmit();
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t(schema ? "editTitle" : "createTitle")}</DialogTitle>
        <DialogDescription>
          {t(schema ? "editDescription" : "createDescription")}
        </DialogDescription>
      </DialogHeader>
      {latestVersion && latestVersion.props.status !== "draft" && (
        <InfoPanel
          variant="warning"
          type="vertical"
          label={tGeneric("warning")}
          message={tVersion("schemaNotInDraft")}
        />
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
          id={schema ? `schema-form-${schema.id}` : "new"}
        >
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
            name="content"
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
          <DialogFooter>
            <LoadingButton loading={isLoading} type="submit">
              {tGeneric("submit")}
            </LoadingButton>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
