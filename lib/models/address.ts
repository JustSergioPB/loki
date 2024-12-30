import { Address as DbAddress } from "@/db/schema/address";
import { AddressSchema } from "../schemas/address.schema";

export type AddressProps = Omit<DbAddress, "id" | "orgId">;

export class Address {
  private _props: AddressProps;

  private constructor(props: AddressProps) {
    this._props = props;
  }

  static create(data: AddressSchema): Address {
    return new Address({
      location: data.location ?? null,
      stateProvince: data.stateProvince ?? null,
      country: data.country,
      createdAt: new Date(),
      updatedAt: null,
    });
  }

  static fromProps(data: DbAddress): Address {
    return new Address(data);
  }

  get props(): AddressProps {
    return this._props;
  }
}
