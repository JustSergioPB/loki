import Breadcrumb from "@/components/app/breadcrumb";
import AppSidebar from "@/components/app/sidebar";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getUser } from "@/lib/helpers/dal";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  return (
    <SidebarProvider>
      <AppSidebar user={user!} />
      <SidebarInset className="h-screen flex flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-3">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb />
          </div>
          <ThemeToggle />
        </header>
        <section className="flex-1 min-h-0 overflow-y-auto">{children}</section>
      </SidebarInset>
    </SidebarProvider>
  );
}
