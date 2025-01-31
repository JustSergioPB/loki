import Banner from "@/components/app/banner";
import { getUser } from "@/lib/helpers/dal";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  if (user) {
    redirect("dashboard");
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <div className="p-6 w-full space-y-6 md:w-2/3 lg:w-1/3 xl:w-1/4 lg:p-0">
        <Banner />
        {children}
      </div>
    </main>
  );
}
