"use client";

import { useUser } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, Mail, ShoppingCart, Settings, LogOut, Home, 
  Compass, BarChart3, Users, ShieldAlert, BadgeCheck, 
  Map, User, Sparkles, FileStack, List, Bed, Star, PenTool
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !loading && !user && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [user, loading, router, pathname, isClient]);

  if (loading || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-safari-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!user && pathname !== "/admin/login") {
    return null;
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const menuItems = [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { type: "separator", label: "Operations" },
    { title: "Bookings", href: "/admin/orders", icon: ShoppingCart },
    { title: "Expeditions", href: "/admin/products", icon: Compass },
    { title: "Destinations", href: "/admin/products2", icon: Map },
    { type: "separator", label: "Catalog" },
    { title: "Accommodations", href: "/admin/accommodations", icon: Bed },
    { title: "Categories", href: "/admin/categories", icon: List },
    { title: "Media Library", href: "/admin/gallery", icon: FileStack },
    { type: "separator", label: "Identity" },
    { title: "Hero Slider", href: "/admin/hero", icon: Sparkles },
    { title: "Email Signatures", href: "/admin/signatures", icon: BadgeCheck },
    { title: "Editorial (Blog)", href: "/admin/blog", icon: PenTool },
    { type: "separator", label: "Intelligence" },
    { title: "BI & Analytics", href: "/admin/analytics", icon: BarChart3 },
    { title: "Inquiry Inbox", href: "/admin/messages", icon: Mail },
    { title: "Audit Logs", href: "/admin/logs", icon: ShieldAlert },
    { title: "System Config", href: "/admin/settings", icon: Settings },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20">
        <Sidebar variant="inset" className="border-none shadow-2xl">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg">M</div>
              <span className="font-headline font-black text-xl uppercase tracking-tighter">Miale Hub</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-0">
            <ScrollArea className="h-full px-4 py-2">
              <SidebarMenu>
                {menuItems.map((item, idx) => {
                  if ("type" in item && item.type === "separator") {
                    return (
                      <div key={`sep-${idx}`} className="px-4 pt-6 pb-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">{item.label}</p>
                      </div>
                    );
                  }

                  const navItem = item as { title: string; href: string; icon: any };
                  const Icon = navItem.icon;

                  return (
                    <SidebarMenuItem key={navItem.href || `item-${idx}`}>
                      <SidebarMenuButton asChild isActive={pathname === navItem.href || (!!navItem.href && navItem.href !== "/admin" && !!pathname?.startsWith(navItem.href))}>
                        <Link href={navItem.href || "#"}>
                          <Icon className="w-4 h-4" />
                          <span className="font-medium">{navItem.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </ScrollArea>
          </SidebarContent>
          <SidebarFooter className="p-6 space-y-4">
             <div className="p-4 bg-muted/30 rounded-2xl flex items-center gap-3 border border-muted/50">
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-white shadow-md">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-secondary uppercase tracking-widest leading-none mb-1">Super Admin</p>
                  <p className="text-[10px] truncate text-foreground font-bold">{user?.email}</p>
                </div>
             </div>
             <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl h-10 border-muted" asChild>
                   <Link href="/"><Home className="w-4 h-4" /></Link>
                </Button>
                <Button variant="ghost" className="flex-1 rounded-xl h-10 text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                   <LogOut className="w-4 h-4" />
                </Button>
             </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col">
          <header className="flex h-16 items-center gap-4 bg-white/50 backdrop-blur-md px-8 sticky top-0 z-30">
            <SidebarTrigger />
            <div className="h-4 w-px bg-muted mx-2" />
            <div className="flex-1">
               <p className="text-[10px] font-space font-bold uppercase tracking-[0.3em] text-muted-foreground">Operational Node: Arusha Central</p>
            </div>
          </header>
          <main className="flex-1 p-8 md:p-12 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
