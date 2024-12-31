import { Certificate as DbCertificate } from "@/db/schema/certificates";

export type CertificateProps = Omit<DbCertificate, "id" | "orgId" | "userId">;
export type CertificateId = number | undefined;

export class Certificate {
  private _props: CertificateProps;
  public readonly id: CertificateId | undefined;

  constructor(props: CertificateProps, id: CertificateId) {
    this._props = props;
    this.id = id;
  }

  static fromProps(props: DbCertificate): Certificate {
    return new Certificate(props, props.id);
  }

  get props(): CertificateProps {
    return this._props;
  }
}
