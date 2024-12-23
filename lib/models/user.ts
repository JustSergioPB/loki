import { User as DbUser } from "@/db/schema/users";
import { SignUpSchema } from "../schemas/sign-up.schema";
import { AuthError } from "../errors/auth.error";
import { Password } from "./password";
import { UserSchema } from "../schemas/user.schema";

export type UserProps = Omit<
  DbUser,
  "id" | "publicId" | "orgId" | "createdAt" | "updatedAt"
>;
export type UserId = number | undefined;
export type UserPublicId = string | undefined;

export class User {
  private _props: UserProps;
  public readonly id: UserId;
  public readonly publicId: UserPublicId;

  private constructor(props: UserProps, id: UserId, publicId: UserPublicId) {
    this._props = props;
    this.id = id;
    this.publicId = publicId;
  }

  static async signUp(data: SignUpSchema): Promise<User> {
    return new User(
      {
        ...data,
        password: (await Password.create(data.password)).value,
        role: "org-admin",
        confirmedAt: null,
        status: "inactive",
      },
      undefined,
      undefined
    );
  }

  static async create(data: UserSchema): Promise<User> {
    return new User(
      {
        ...data,
        password: (await Password.random()).value,
        confirmedAt: null,
        status: "inactive",
      },
      undefined,
      undefined
    );
  }

  static fromProps(data: DbUser): User {
    return new User(data, data.id, data.publicId);
  }

  get props(): UserProps {
    return this._props;
  }

  async login(password: string): Promise<void> {
    const isEqual = await Password.fromValue(this._props.password).compare(
      password
    );

    if (!isEqual) {
      throw new AuthError("invalidCredentials");
    }
  }

  async resetPassword(password: string): Promise<void> {
    this._props = {
      ...this._props,
      password: (await Password.create(password)).value,
    };
  }

  confirm(): void {
    this._props = { ...this._props, confirmedAt: new Date(), status: "active" };
  }

  isAdmin(): boolean {
    return this._props.role === "admin";
  }
}
