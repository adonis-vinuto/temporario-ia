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

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar collapsible="icon">
        {/* Header com Logo e Nome */}
        <SidebarHeader className="border-b">
          <div className="flex items-center gap-3 px-3 py-4">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
              K
            </div>
            {open && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-lg font-bold">KOMVOS</span>
                <span className="text-sm text-muted-foreground">MIND</span>
              </div>
            )}
          </div>
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
        <SidebarFooter className="border-t">
          <div className={`${open ? 'p-4' : 'p-2'}`}>
            {open ? (
              <>
                {/* Informações do usuário - visível quando expandido */}
                <div className="flex flex-col gap-2 mb-3">
                  <span className="text-sm font-medium truncate">
                    {status === "loading" ? "Carregando..." : session?.user?.name || "Usuário"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {status === "loading" ? "..." : session?.user?.email || "email@exemplo.com"}
                  </span>
                </div>
                
                {/* Botão de Logout com texto */}
                <LogoutButton 
                  showText={true}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                />
              </>
            ) : (
              /* Quando colapsado, mostra apenas o botão de logout com tooltip */
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <LogoutButton 
                      showText={false}
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="text-xs">
                    <div className="font-medium">{session?.user?.name || "Usuário"}</div>
                    <div className="text-muted-foreground">{session?.user?.email || "email@exemplo.com"}</div>
                    <div className="mt-1 text-destructive">Clique para sair</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}