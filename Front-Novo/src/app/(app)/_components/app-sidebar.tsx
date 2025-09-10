"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Box,
  UsersRound,
  FileText,
  BookOpen,
  Cable,
  ChevronsUpDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import logout from "@/lib/utils/logout";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useModuleStore } from "@/lib/context/use-module-store";
import { Module, ModuleLabels } from "@/types/enums/module";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Box },
  { title: "Agentes", url: "/agents", icon: UsersRound },
  { title: "Arquivos", url: "/files", icon: FileText },
  { title: "Conhecimento", url: "/knowledge", icon: BookOpen },
  { title: "Integrações", url: "/integrations", icon: Cable },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { open } = useSidebar();

  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(`${url}/`);

  const { module, setModule } = useModuleStore();

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar collapsible="icon" className="relative">
        <SidebarToggle />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-sidebar-border/60 to-transparent" />

        <SidebarHeader className="border-b border-white/40">
          <div
            className={cn(
              "px-3 py-4",
              open ? "flex items-center gap-3" : "flex items-center justify-center"
            )}
          >
            <div className={cn("shrink-0", !open && "flex justify-center")}>
              <Image
                src="/images/logo.png"
                alt="Komvos"
                width={open ? 50 : 30}
                height={open ? 20 : 30}
                priority
                className={cn("rounded-md", !open && "rounded-lg")}
              />
            </div>

            {open && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-2xl font-bold text-sidebar-foreground uppercase first-letter:text-4xl">
                  KOMVOS
                </span>
                <span className="text-xl text-sidebar-foreground/80 uppercase first-letter:text-2xl">
                  MIND
                </span>
              </div>
            )}
          </div>
          {open && (
            <div className={cn("px-3 pb-3", !open && "flex justify-center")}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "sidebar-outline-button relative flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors",
                      "hover:bg-sidebar-accent/25"
                    )}
                  >
                    <span>{ModuleLabels[module]}</span>
                    <ChevronsUpDown className="ml-auto h-4 w-4 text-sidebar-foreground/60" />

                    <svg
                      className="mo__svg"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <rect
                        className="mo__rect"
                        x="1.5"
                        y="1.5"
                        width="97"
                        height="97"
                        rx="4"
                        ry="4"
                      />
                    </svg>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side="right"
                  align="start"
                  className="w-40 ml-1 bg-background text-card-foreground border border-sidebar-border"
                >
                  {(Object.values(Module) as Module[]).map((m) => (
                    <DropdownMenuItem
                      key={m}
                      onClick={() => setModule(m)}
                      className="cursor-pointer"
                    >
                      {ModuleLabels[m]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {!open ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            isActive={pathname === item.url}
                            className={cn(
                              "sidebar-outline-button relative justify-center transition-colors",
                              "hover:bg-sidebar-accent/25 data-[active=true]:bg-sidebar-primary/15"
                            )}
                          >
                            <Link href={item.url} className="relative flex items-center">
                              <item.icon className="h-8 w-8" />
                              <span className="sr-only">{item.title}</span>
                              <svg className="mo__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                                <rect className="mo__rect" x="1.5" y="1.5" width="97" height="97" rx="4" ry="4" />
                              </svg>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">{item.title}</TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        className={cn(
                          "sidebar-outline-button relative transition-colors",
                          "hover:bg-sidebar-accent/25",
                          "data-[active=true]:bg-sidebar-primary/15 data-[active=true]:text-sidebar-foreground"
                        )}
                      >
                        <Link href={item.url} className="relative flex items-center gap-2">
                          <item.icon className="h-10 w-10" />
                          <span className="text-base">{item.title}</span>
                          <svg className="mo__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                            <rect className="mo__rect" x="1.5" y="1.5" width="97" height="97" rx="4" ry="4" />
                          </svg>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-white/40">
          <div className={open ? "p-4" : "p-2"}>
            {open ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "sidebar-outline-button relative flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors",
                      "hover:bg-sidebar-accent/25"
                    )}
                  >
                    <UserAvatar
                      name={session?.user?.name || "Usuário"}
                      image={null}
                      size={36}
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium truncate">
                        {status === "loading"
                          ? "Carregando..."
                          : session?.user?.name || "Usuário"}
                      </span>
                      <span className="text-xs text-sidebar-foreground/75 truncate">
                        {status === "loading"
                          ? "..."
                          : session?.user?.email || "email@exemplo.com"}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto h-4 w-4 text-sidebar-foreground/60" />

                    {/* contorno animado */}
                    <svg
                      className="mo__svg"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <rect
                        className="mo__rect"
                        x="1.5"
                        y="1.5"
                        width="97"
                        height="97"
                        rx="4"
                        ry="4"
                      />
                    </svg>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side="right"
                  align="start"
                  className="w-56 ml-1 bg-background text-card-foreground border border-sidebar-border"
                >
                  <DropdownMenuLabel className="flex flex-col">
                    <span className="font-bold">
                      {session?.user?.name || "Usuário"}
                    </span>
                    <span className="text-xs text-card-foreground/70">
                      {session?.user?.email || "email@exemplo.com"}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a
                      href="/api/keycloak/profile"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4 text-card-foreground" />
                      Perfil
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-card-foreground" />
                      Configurações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-red-600 cursor-pointer"
                    onClick={async () => {
                      await logout();
                      window.location.href = "/";
                    }}
                  >
                    <LogOut className="h-4 w-4 text-red-600" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex justify-center">
                <UserAvatar
                  name={session?.user?.name || "Usuário"}
                  image={null}
                  size={36}
                />
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
