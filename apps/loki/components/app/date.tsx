import { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  date: Date | null | undefined;
}

export default function Date({ date, className }: Props) {
  return (
    <p className={className}>
      {date ? date.toLocaleString() : "--/--/----, --:--:-- --"}
    </p>
  );
}
