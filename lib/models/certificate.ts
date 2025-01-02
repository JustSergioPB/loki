import { Certificate as DbCertificate } from "@/db/schema/certificates";
import * as forge from "node-forge";
import * as crypto from "crypto";
import { Org } from "./org";
import { OrgError } from "../errors/org.error";
import { User } from "./user";

export type CertificateProps = Omit<DbCertificate, "id" | "orgId" | "userId">;
export type CertificateId = number | undefined;

const ROOT_ATTRS = [
  {
    name: "commonName",
    value: "Root CA",
  },
  {
    name: "countryName",
    value: "ES",
  },
  {
    shortName: "ST",
    value: "La Rioja",
  },
  {
    name: "localityName",
    value: "Logroño",
  },
  {
    name: "organizationName",
    value: "Stachelabs",
  },
];

const ROOT_EXTENSIONS = [
  {
    name: "basicConstraints",
    cA: true,
    critical: true,
  },
  {
    name: "keyUsage",
    keyCertSign: true,
    cRLSign: true,
    critical: true,
  },
];

const INTERMEDIATE_EXTENSIONS = [
  {
    name: "basicConstraints",
    cA: true,
    pathLenConstraint: 0,
    critical: true,
  },
  {
    name: "keyUsage",
    keyCertSign: true,
    cRLSign: true,
    critical: true,
  },
  {
    name: "authorityKeyIdentifier",
  },
  {
    name: "subjectKeyIdentifier",
  },
];

export class Certificate {
  private _props: CertificateProps;
  public readonly id: CertificateId | undefined;

  constructor(props: CertificateProps, id: CertificateId) {
    this._props = props;
    this.id = id;
  }

  static createRoot() {
    const serialNumber = "01";
    const cert = forge.pki.createCertificate();
    const expiresAt = new Date();
    expiresAt.setFullYear(new Date().getFullYear() + 10);

    cert.serialNumber = serialNumber;
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = expiresAt;
    cert.setSubject(ROOT_ATTRS);
    cert.setIssuer(ROOT_ATTRS);
    cert.setExtensions(ROOT_EXTENSIONS);

    return new Certificate(
      {
        level: "root",
        isActive: true,
        certPem: forge.pki.certificateToPem(cert),
        serialNumber,
        expiresAt,
        revokedAt: null,
        revocationReason: null,
        createdAt: new Date(),
        updatedAt: null,
      },
      undefined
    );
  }

  static createIntermediate(org: Org, issuer: Certificate) {
    const cert = forge.pki.createCertificate();
    const expiresAt = new Date();
    const serialNumber = this.generateSerialNumber();

    expiresAt.setFullYear(new Date().getFullYear() + 5);
    cert.serialNumber = serialNumber;
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = expiresAt;

    const attrs = [];

    if (!org.address) {
      throw new OrgError("missingAddress");
    }

    attrs.push(
      {
        name: "commonName",
        value: `${org.props.name} Intermediate CA`,
      },
      {
        name: "countryName",
        value: org.address.props.country,
      },
      {
        name: "organizationName",
        value: org.props.name,
      }
    );

    if (org.address.props.stateProvince) {
      attrs.push({
        shortName: "ST",
        value: org.address.props.stateProvince,
      });
    }

    if (org.address.props.location) {
      attrs.push({
        name: "localityName",
        value: org.address.props.location,
      });
    }

    cert.setSubject(attrs);
    cert.setExtensions(INTERMEDIATE_EXTENSIONS);
    const issuerCert = forge.pki.certificateFromPem(issuer.props.certPem);
    cert.setIssuer(issuerCert.subject.attributes);

    return new Certificate(
      {
        level: "entity",
        isActive: true,
        certPem: forge.pki.certificateToPem(cert),
        serialNumber,
        expiresAt,
        revokedAt: null,
        revocationReason: null,
        createdAt: new Date(),
        updatedAt: null,
      },
      undefined
    );
  }

  static createEnd(org: Org, issuer: Certificate, user?: User) {
    const cert = forge.pki.createCertificate();
    const expiresAt = new Date();
    const serialNumber = this.generateSerialNumber();

    expiresAt.setFullYear(new Date().getFullYear() + 1);
    cert.serialNumber = serialNumber;
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = expiresAt;

    const attrs = [];

    if (!org.address) {
      throw new OrgError("missingAddress");
    }

    attrs.push(
      {
        name: "commonName",
        value: `${user?.props.email ?? org.props.name} Entity`,
      },
      {
        name: "countryName",
        value: org.address.props.country,
      },
      {
        name: "organizationName",
        value: org.props.name,
      }
    );

    if (user?.props.title) {
      attrs.push({
        name: "title",
        value: user.props.title,
      });
    }

    if (org.address.props.stateProvince) {
      attrs.push({
        shortName: "ST",
        value: org.address.props.stateProvince,
      });
    }

    if (org.address.props.location) {
      attrs.push({
        name: "localityName",
        value: org.address.props.location,
      });
    }

    cert.setSubject(attrs);
    cert.setExtensions([
      {
        name: "basicConstraints",
        cA: false,
        critical: true,
      },
      {
        name: "keyUsage",
        digitalSignature: true,
        keyEncipherment: !!user,
        critical: true,
      },
      {
        name: "extKeyUsage",
        serverAuth: !!user,
        clientAuth: true,
      },
      {
        name: "authorityKeyIdentifier",
      },
      {
        name: "subjectKeyIdentifier",
      },
    ]);
    const issuerCert = forge.pki.certificateFromPem(issuer.props.certPem);
    cert.setIssuer(issuerCert.subject.attributes);

    return new Certificate(
      {
        level: "entity",
        isActive: true,
        certPem: forge.pki.certificateToPem(cert),
        serialNumber,
        expiresAt,
        revokedAt: null,
        revocationReason: null,
        createdAt: new Date(),
        updatedAt: null,
      },
      undefined
    );
  }

  static fromProps(props: DbCertificate): Certificate {
    return new Certificate(props, props.id);
  }

  get props(): CertificateProps {
    return this._props;
  }

  private static generateSerialNumber(): string {
    return crypto.randomBytes(16).toString("hex");
  }
}
