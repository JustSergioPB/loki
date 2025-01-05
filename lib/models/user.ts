import { DbUser } from "@/db/schema/users";

export type UserProps = Omit<DbUser, "id" | "orgId" | "org">;
export type CreateUserProps = Pick<
  DbUser,
  "fullName" | "email" | "password" | "role" | "position"
>;
export type UpdateUserProps = Partial<CreateUserProps>;
export type UserId = string | undefined;

export const userRoles = ["admin", "org-admin", "issuer"] as const;
export type UserRole = (typeof userRoles)[number];

export const userStatuses = ["active", "inactive", "banned"] as const;
export type UserStatus = (typeof userStatuses)[number];

export class User {
  private _props: UserProps;
  public readonly id: UserId;

  private constructor(props: UserProps, id: UserId) {
    this._props = props;
    this.id = id;
  }

  static signUp(props: Omit<CreateUserProps, "position" | "role">): User {
    return new User(
      {
        ...props,
        role: "org-admin",
        confirmedAt: null,
        status: "inactive",
        createdAt: new Date(),
        updatedAt: null,
        position: null,
      },
      undefined
    );
  }

  static create(props: CreateUserProps): User {
    return new User(
      {
        ...props,
        confirmedAt: null,
        status: "inactive",
        createdAt: new Date(),
        updatedAt: null,
      },
      undefined
    );
  }

  static fromProps(props: DbUser): User {
    return new User(props, props.id);
  }

  get props(): UserProps {
    return this._props;
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

  confirm(position: string): void {
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
