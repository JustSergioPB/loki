import Banner from "@/components/app/banner";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function HallLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslations("NeedHelp");

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <div className="p-6 w-full space-y-6 md:w-2/3 lg:w-1/3 xl:w-1/4 lg:p-0">
        <Banner />
        {children}
        <div className="mt-6 text-center text-sm">
          {t("title")}{" "}
          <Link
            href={`mailto:${process.env.SUPPORT_EMAIL}`}
            className="underline font-semibold"
          >
            {process.env.SUPPORT_EMAIL}
          </Link>
        </div>
      </div>
    </main>
  );
}
