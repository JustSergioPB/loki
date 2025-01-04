import crypto from "crypto";
import { DbUserToken } from "@/db/schema/user-tokens";
import { TokenError } from "../errors/token.error";

export type TokenProps = Omit<DbUserToken, "id" | "orgId" | "userId">;
export type CreateTokenProps = Pick<TokenProps, "sentTo" | "context">;
export type TokenId = string | undefined;

export const tokenContexts = ["confirmation", "reset-password"] as const;
export type TokenContext = (typeof tokenContexts)[number];

export class Token {
  private _props: TokenProps;
  private updatedAt: Date | null;
  public readonly id: TokenId;

  private constructor(props: TokenProps, id: TokenId, updatedAt: Date | null) {
    this._props = props;
    this.id = id;
    this.updatedAt = updatedAt;
  }

  static create(data: CreateTokenProps): Token {
    return new Token(
      {
        ...data,
        token: crypto.randomBytes(32).toString("hex"),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: null,
      },
      undefined,
      null
    );
  }

  static fromProps(data: DbUserToken): Token {
    return new Token(data, data.id, data.updatedAt);
  }

  get props(): TokenProps {
    return this._props;
  }

  burn(context: TokenContext): void {
    if (new Date() > this._props.expiresAt) {
      throw new TokenError("expired");
    }

    if (this.updatedAt) {
      throw new TokenError("burnt");
    }

    if (this._props.context !== context) {
      throw new TokenError("invalidContext");
    }

    this._props.updatedAt = new Date();
  }
}
