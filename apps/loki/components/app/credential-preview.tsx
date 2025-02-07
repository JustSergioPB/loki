import { CredentialSchema } from "@/lib/types/credential-schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import JsonSchemaField from "./json-schema-field";
import { useTranslations } from "next-intl";
import { DatetimePicker } from "../ui/datetime-picker";
import { Clock } from "lucide-react";

type Props = {
  credentialSchema: CredentialSchema;
};

export default function CredentialPreview({ credentialSchema }: Props) {
  const t = useTranslations("Credential");
  const tVersion = useTranslations("FormVersion");

  const {
    properties: { credentialSubject, type },
  } = credentialSchema;

  return (
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
      <CardContent className="pb-6 space-y-6">
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {tVersion("validFrom")}
            </p>
            <DatetimePicker
              className="w-72"
              format={[
                ["days", "months", "years"],
                ["hours", "minutes", "seconds"],
              ]}
              dtOptions={{
                hour12: false,
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {tVersion("validUntil")}
            </p>
            <DatetimePicker
              className="w-72"
              format={[
                ["days", "months", "years"],
                ["hours", "minutes", "seconds"],
              ]}
              dtOptions={{
                hour12: false,
              }}
            />
          </div>
        </div>
        {Object.entries(credentialSubject.properties ?? {})
          .filter(([key]) => key !== "id")
          .map(([key, schema]) => (
            <JsonSchemaField key={key} jsonSchema={schema} />
          ))}
      </CardContent>
    </Card>
  );
}
