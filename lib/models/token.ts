import crypto from "crypto";
import { UserToken as DbToken } from "@/db/schema/user-tokens";
import { TokenError } from "../errors/token.error";

export type TokenProps = Omit<DbToken, "id" | "publicId" | "orgId" | "userId">;
export type CreateTokenProps = Pick<TokenProps, "sentTo" | "context">;

export class Token {
  private _props: TokenProps;

  private constructor(props: TokenProps) {
    this._props = props;
  }

  static create(data: CreateTokenProps): Token {
    return new Token({
      ...data,
      token: crypto.randomBytes(32).toString("hex"),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: null,
    });
  }

  static fromProps(data: DbToken): Token {
    return new Token(data);
  }

  get props(): TokenProps {
    return this._props;
  }

  burn(context: string): void {
    if (new Date() > this._props.expiresAt) {
      throw new TokenError("expired");
    }

    if (this._props.updatedAt) {
      throw new TokenError("burnt");
    }

    if (this._props.context !== context) {
      throw new TokenError("invalidContext");
    }

    this._props.updatedAt = new Date();
  }
}
