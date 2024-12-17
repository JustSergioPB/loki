import Banner from "@/components/app/banner";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <div className="p-6 w-full space-y-6 lg:w-1/4 lg:p-0">
        <Banner />
        {children}
      </div>
    </main>
  );
}
