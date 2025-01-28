import { CredentialSchema } from "@/lib/types/credential-schema";
import { ClaimSchema } from "@/lib/schemas/claim.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { LoadingButton } from "@/components/app/loading-button";
import {
  credentialSubjectToZod,
  getDefaultCredentialSubject,
} from "@/lib/helpers/json-schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import JsonSchemaForm from "./json-schema-form";
import { DatetimePicker } from "@/components/ui/datetime-picker";
import * as z from "zod";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

type Props = {
  isLoading: boolean;
  credentialSchema: CredentialSchema;
  className?: string;
  disabled?: boolean;
  onSubmit: (data: ClaimSchema) => void;
};

export default function CredentialSchemaForm({
  credentialSchema,
  isLoading,
  onSubmit,
  className,
  disabled,
}: Props) {
  const t = useTranslations("Credential");
  const tGeneric = useTranslations("Generic");
  const tVersion = useTranslations("FormVersion");

  const {
    properties: { credentialSubject, type },
  } = credentialSchema;

  const form = useForm<ClaimSchema>({
    resolver: zodResolver(
      z.object({
        validUntil: z.coerce.date().optional(),
        validFrom: z.coerce.date().optional(),
        credentialSubject: credentialSubjectToZod(credentialSubject),
      })
    ),
    defaultValues: {
      credentialSubject: getDefaultCredentialSubject(credentialSubject),
      validUntil: undefined,
      validFrom: undefined,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn(className)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{credentialSchema.title}</CardTitle>
            <CardDescription>{credentialSchema.description}</CardDescription>
            <div className="flex items-center gap-1">
              {type.const?.slice(1).map((type, idx) => (
                <Badge variant="secondary" key={`${type}-${idx}`}>
                  {type as string}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <div className="flex items-center justify-center bg-muted rounded-md size-10 shrink-0">
                <Clock className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-lg leading-none">
                  {t("validityTitle")}
                </p>
                <p className="text-muted-foreground leading-tight">
                  {t("validitySubtitle")}
                </p>
              </div>
            </div>
            <div>
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>{tVersion("validFrom")}</FormLabel>
                    <FormControl>
                      <DatetimePicker
                        {...field}
                        format={[
                          ["days", "months", "years"],
                          ["hours", "minutes", "seconds"],
                        ]}
                        className="w-72"
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
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>{tVersion("validUntil")}</FormLabel>
                    <FormControl>
                      <DatetimePicker
                        {...field}
                        className="w-72"
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
            <FormField
              name="credentialSubject"
              render={() => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-4">
                      {Object.entries(credentialSubject.properties ?? {})
                        .filter(([key]) => key !== "id")
                        .map(([key, schema]) => (
                          <JsonSchemaForm
                            key={key}
                            path={`credentialSubject.${key}`}
                            jsonSchema={schema}
                            className="w-full"
                            required
                          />
                        ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <LoadingButton
              loading={isLoading}
              type="submit"
              disabled={disabled}
            >
              {tGeneric("submit")}
            </LoadingButton>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
