import { DbUser } from "@/db/schema/users";
import { UserDID } from "./user-did";
import { DID } from "./did";

export type UserProps = Omit<DbUser, "id" | "orgId" | "org">;
export type CreateUserProps = Pick<
  DbUser,
  "fullName" | "email" | "password" | "role" | "position"
>;
export type UpdateUserProps = Partial<CreateUserProps>;

export const userRoles = ["admin", "org-admin", "issuer"] as const;
export type UserRole = (typeof userRoles)[number];

export const userStatuses = ["active", "inactive", "banned"] as const;
export type UserStatus = (typeof userStatuses)[number];

export class User {
  private _props: UserProps;
  private _did: UserDID | undefined;
  public readonly id: string | undefined;

  private constructor(props: UserProps, id?: string, did?: DID) {
    this._props = props;
    this.id = id;
    this._did = did;
  }

  static signUp(props: Omit<CreateUserProps, "position" | "role">): User {
    return new User({
      ...props,
      role: "org-admin",
      confirmedAt: null,
      status: "inactive",
      createdAt: new Date(),
      updatedAt: null,
      position: null,
    });
  }

  static create(props: CreateUserProps): User {
    return new User({
      ...props,
      confirmedAt: null,
      status: "inactive",
      createdAt: new Date(),
      updatedAt: null,
    });
  }

  static fromProps(props: DbUser): User {
    const did = props.did ? UserDID.fromProps(props.did) : undefined;
    return new User(props, props.id, did);
  }

  get props(): UserProps {
    return this._props;
  }

  get did(): UserDID | undefined {
    return this._did;
  }

  resetPassword(password: string): void {
    this._props = {
      ...this._props,
      password,
      updatedAt: new Date(),
    };
  }

  update(props: UpdateUserProps): void {
    this._props = { ...this._props, ...props, updatedAt: new Date() };
  }

  confirm(position: string, did?: UserDID): void {
    this._did = did;
    this._props = {
      ...this._props,
      position,
      confirmedAt: new Date(),
      status: "active",
      updatedAt: new Date(),
    };
  }

  isAdmin(): boolean {
    return this._props.role === "admin";
  }

  ban(): void {
    this._props = {
      ...this._props,
      status: "banned",
      updatedAt: new Date(),
    };
  }

  activate(): void {
    this._props = {
      ...this._props,
      status: "active",
      updatedAt: new Date(),
    };
  }

  deactivate(): void {
    this._props = {
      ...this._props,
      status: "inactive",
      updatedAt: new Date(),
    };
  }
}
