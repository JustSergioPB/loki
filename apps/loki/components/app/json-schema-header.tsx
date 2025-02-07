import { JsonSchemaType, JsonType } from "@/lib/types/json-schema";
import { cn } from "@/lib/utils";
import {
  Binary,
  CircleSlash2,
  Group,
  LayoutList,
  Sigma,
  Text,
} from "lucide-react";
import { ReactNode } from "react";

type Props = {
  jsonSchema: JsonSchemaType;
  variant?: "main" | "secondary";
};

export const ICON_MAP: Record<JsonType, ReactNode> = {
  string: <Text className="size-4" />,
  number: <Sigma className="size-4" />,
  boolean: <Binary className="size-4" />,
  object: <Group className="size-5" />,
  integer: <Sigma className="size-4" />,
  null: <CircleSlash2 className="size-4" />,
  array: <LayoutList className="size-5" />,
};

export default function JsonSchemaHeader({
  jsonSchema: { title, description },
  variant = "main",
}: Props) {
  return (
    (title || description) && (
      <div>
        {title && (
          <p
            className={cn(
              "leading-none",
              variant === "main"
                ? "text-xl font-bold"
                : "text-base font-semibold"
            )}
          >
            {title}
          </p>
        )}
        {description && (
          <p className="text-muted-foreground leading-tight">{description}</p>
        )}
      </div>
    )
  );
}
