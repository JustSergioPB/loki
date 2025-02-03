import Banner from "@/components/app/banner";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <div className="p-6 w-full space-y-6 md:w-2/3 lg:w-1/3 xl:w-1/4 lg:p-0">
        <Banner />
        {children}
      </div>
    </main>
  );
}
