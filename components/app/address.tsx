import { Address as DbAdress } from "@/db/schema/address";
import { Address as AddressEntity } from "@/lib/models/address";
import { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  address: DbAdress | null;
}

export default function Address({ address: addressProps, className }: Props) {
  const addressString = addressProps
    ? AddressEntity.fromProps(addressProps).toString()
    : "--";
  return <p className={className}>{addressString}</p>;
}
