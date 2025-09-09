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
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LogoutButton } from "@/components/logout-button";
import { SidebarToggle } from "@/components/sidebar-toggle";

// Itens do menu principal
const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Box,
    disabled: true,
  },
  {
    title: "Agentes",
    url: "/agents",
    icon: UsersRound,
    disabled: true,
  },
  {
    title: "Arquivos",
    url: "/files",
    icon: FileText,
    disabled: true,
  },
  {
    title: "Conhecimentos",
    url: "/knowledges",
    icon: BookOpen,
    disabled: true,
  },
  {
    title: "Integrações",
    url: "/integrations",
    icon: Cable,
    disabled: true,
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
    disabled: true,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { open } = useSidebar();
  const userName = status === "loading" ? "Carregando..." : session?.user?.name || "Usuário";
  const userEmail = status === "loading" ? "..." : session?.user?.email || "email@exemplo.com";
  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar collapsible="icon">
        {/* Header com Logo, Nome e Botão de Colapso */}
        <SidebarHeader className="relative border-b bg-gradient-primary text-white">
          <div className="flex items-center gap-3 px-3 py-4">
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center font-bold shrink-0">
              K
            </div>
            {open && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-lg font-bold">KOMVOS</span>
                <span className="text-sm opacity-80">MIND</span>
              </div>
            )}
          </div>
          <SidebarToggle className="absolute -right-3 top-2 text-white hover:bg-white/10" />
        </SidebarHeader>

        {/* Conteúdo Principal - Menu de Navegação */}
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
                            disabled={item.disabled}
                            className={item.disabled ? "opacity-50 cursor-not-allowed" : ""}
                          >
                            <Link 
                              href={item.disabled ? "#" : item.url}
                              onClick={(e) => {
                                if (item.disabled) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <item.icon className="h-4 w-4" />
                              <span className="sr-only">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                        disabled={item.disabled}
                        className={item.disabled ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        <Link 
                          href={item.disabled ? "#" : item.url}
                          onClick={(e) => {
                            if (item.disabled) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer com Informações do Usuário */}
        <SidebarFooter className="border-t bg-gradient-primary text-white">
          <div className={open ? "p-4" : "p-2"}>
            {open ? (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
                  {userInitial}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate">{userName}</span>
                  <span className="text-xs opacity-80 truncate">{userEmail}</span>
                </div>
                <LogoutButton
                  showText={false}
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-8 w-8 text-white hover:bg-white/10"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
                  {userInitial}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <LogoutButton
                      showText={false}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/10"
                    />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="text-xs">
                      <div className="font-medium">{userName}</div>
                      <div className="text-muted-foreground">{userEmail}</div>
                      <div className="mt-1 text-destructive">Clique para sair</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}