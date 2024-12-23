import bcrypt from "bcrypt";

export class Password {
  private _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static async create(value: string): Promise<Password> {
    const password =
      process.env.NODE_ENV === "production"
        ? await bcrypt.hash(value, 10)
        : value;
    return new Password(password);
  }

  static async random(): Promise<Password> {
    const rand = this.generateRandom();

    const password =
      process.env.NODE_ENV === "production"
        ? await bcrypt.hash(rand, 10)
        : rand;
    return new Password(password);
  }

  static fromValue(value: string): Password {
    return new Password(value);
  }

  get value(): string {
    return this._value;
  }

  async compare(value: string): Promise<boolean> {
    return process.env.NODE_ENV === "production"
      ? bcrypt.compare(value, this._value)
      : value === this._value;
  }

  private static generateRandom(): string {
    return "default";
  }
}
