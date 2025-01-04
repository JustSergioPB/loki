import bcrypt from "bcrypt";

export class PasswordProvider {
  static async encrypt(value: string): Promise<string> {
    return process.env.NODE_ENV === "production"
      ? await bcrypt.hash(value, 10)
      : value;
  }

  static async compare(value: string, hash: string): Promise<boolean> {
    return process.env.NODE_ENV === "production"
      ? bcrypt.compare(value, hash)
      : value === hash;
  }

  static async random(): Promise<string> {
    return process.env.NODE_ENV === "production"
      ? await bcrypt.hash(Math.random().toString(), 10)
      : Math.random().toString();
  }
}
