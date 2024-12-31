import { User as DbUser } from "@/db/schema/users";
import { SignUpSchema } from "../schemas/sign-up.schema";
import { AuthError } from "../errors/auth.error";
import { Password } from "./password";
import { UserSchema } from "../schemas/user.schema";
import { Certificate } from "./certificate";

export type UserProps = Omit<DbUser, "id" | "publicId" | "orgId">;
export type UserId = number | undefined;

export class User {
  private _props: UserProps;
  private _certificates: Certificate[];
  public readonly id: UserId;

  private constructor(
    props: UserProps,
    certificates: Certificate[],
    id: UserId
  ) {
    this._props = props;
    this._certificates = certificates;
    this.id = id;
  }

  static async signUp(props: SignUpSchema): Promise<User> {
    return new User(
      {
        ...props,
        password: (await Password.create(props.password)).value,
        role: "org-admin",
        confirmedAt: null,
        status: "inactive",
        createdAt: new Date(),
        updatedAt: null,
        title: null,
      },
      [],
      undefined
    );
  }

  static async create(props: UserSchema): Promise<User> {
    return new User(
      {
        ...props,
        password: (await Password.random()).value,
        confirmedAt: null,
        status: "inactive",
        createdAt: new Date(),
        updatedAt: null,
      },
      [],
      undefined
    );
  }

  static fromProps(props: DbUser): User {
    const { certificates: certificateProps, id, ...rest } = props;

    const certificates = certificateProps
      ? certificateProps.map((certProps) => Certificate.fromProps(certProps))
      : [];

    return new User(rest, certificates, id);
  }

  get certificates(): Certificate[] {
    return this._certificates;
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
      updatedAt: new Date(),
    };
  }

  generateCertificate(): void {}

  update(props: UserSchema): void {
    this._props = { ...this._props, ...props, updatedAt: new Date() };
  }

  confirm(title: string): void {
    this._props = {
      ...this._props,
      title,
      confirmedAt: new Date(),
      status: "active",
      updatedAt: new Date(),
    };
  }

  isAdmin(): boolean {
    return this._props.role === "admin";
  }
}
