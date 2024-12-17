import { User as DbUser } from "@/db/schema/users";
import { SignUpSchema } from "../schemas/sign-up.schema";
import bcrypt from "bcrypt";
import { AuthError } from "../errors/auth.error";

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
        password: await bcrypt.hash(data.password, 10),
        role: "org-admin",
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
    const isEqual = await bcrypt.compare(password, this._props.password);

    if (!isEqual) {
      throw new AuthError("invalidCredentials");
    }
  }

  async resetPassword(password: string): Promise<void> {
    this._props = { ...this._props, password: await bcrypt.hash(password, 10) };
  }

  confirm(): void {
    this._props = { ...this._props, confirmedAt: new Date() };
  }
}
