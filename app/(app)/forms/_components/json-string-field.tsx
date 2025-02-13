import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JsonStringFormat, JsonStringType } from "@/lib/types/json-schema";
import { cn } from "@/lib/utils";
import { HTMLInputTypeAttribute } from "react";

const FORMAT_MAP: Record<JsonStringFormat, HTMLInputTypeAttribute> = {
  datetime: "datetime-local",
  date: "date",
  time: "time",
  email: "email",
  uri: "url",
  uuid: "text",
};

type Props = {
  path: string;
  jsonSchema: JsonStringType;
  className?: string;
};

export default function JsonStringForm({ path, jsonSchema, className }: Props) {
  const placeholder = jsonSchema.examples?.[0]?.toString() ?? "";

  const { format, minLength, maxLength, pattern, title } = jsonSchema;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={path}>{title}</Label>
      <Input
        id={path}
        placeholder={placeholder}
        type={format ? FORMAT_MAP[format] : "text"}
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        disabled
      />
    </div>
  );
}
