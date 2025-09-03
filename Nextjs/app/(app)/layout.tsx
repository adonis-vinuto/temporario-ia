"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import NavItem from "@/components/navItem";
import {
  //Home,
  Box,
  UsersRound,
  Layers,
  BookOpen,
  Sliders,
  //Bell,
  //HelpCircle,
  Settings,
  //MoreVertical,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import Image from "next/image";
import komvos from "@/public/img/Imagem1.png";
import { ModuleSelector } from "@/components/ModuleSelector";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
//import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function NavbarEsquerda({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Barra colapsada por padrão
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <div className="flex h-dvh overflow-hidden">
      <aside
        className={`${isSidebarCollapsed ? "w-16" : "w-64"
          } bg-sidebar text-sidebar-foreground p-4 flex flex-col justify-between rounded-tr-xl rounded-br-xl overflow-y-auto transition-all duration-300`}
      >
        {/* Topo - Logo e módulo */}
        <div>
          <Link
            href="/"
            className="mb-4 flex items-center gap-2 px-2 justify-start"
          >
            <Image
              src={komvos}
              alt="Logo Komvos"
              width={40}
              height={40}
              className={`rounded-full transition-transform duration-300 ${isSidebarCollapsed ? "scale-150" : "scale-100"
                }`}
            />
            {!isSidebarCollapsed && (
              <div>
                <div className="text-2xl font-bold leading-tight">KOMVOS</div>
                <div className="text-s tracking-wide">MIND</div>
              </div>
            )}
          </Link>

          {/* Botão de módulo */}
          {!isSidebarCollapsed && (
            <div className="mb-2">
              <ModuleSelector />
            </div>
          )}

          {/* Navegação principal */}
          <nav className="flex flex-col gap-3 mt-4">
            {/* <NavItem
              label="Home"
              Icon={Home}
              link="/"
              active={pathname === "/"}
              collapsed={isSidebarCollapsed}
            /> */}
            <NavItem
              label="Dashboard"
              Icon={Box}
              link="/dashboard"
              active={pathname === "/dashboard"}
              collapsed={isSidebarCollapsed}
            />
            <NavItem
              label="Agentes"
              Icon={UsersRound}
              link="/agents"
              active={pathname === "/agents"}
              collapsed={isSidebarCollapsed}
            />
            <NavItem
              label="Arquivos"
              Icon={Layers}
              link="/files"
              active={pathname === "/files"}
              collapsed={isSidebarCollapsed}
            />
            <NavItem
              label="Conhecimentos"
              Icon={BookOpen}
              link="/knowledges"
              active={pathname === "/knowledges"}
              collapsed={isSidebarCollapsed}
            />
            <NavItem
              label="Integrações"
              Icon={Sliders}
              link="/integrations"
              active={pathname === "/integrations"}
              collapsed={isSidebarCollapsed}
            />
          </nav>
        </div>

        {/* Rodapé com opções e usuário */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {/*<ThemeToggle />*/}
            {/* 
            <div className="relative">
              
              <NavItem
                label="Notificações"
                Icon={Bell}
                link="/notifications"
                active={pathname === "/notifications"}
                collapsed={isSidebarCollapsed}
              /> 
              <span
                className={`absolute ${
                  isSidebarCollapsed ? "right-1" : "right-4"
                } top-0 text-xs bg-white text-black rounded-full px-2 py-0.5`}
              >
                12
              </span>
              
            </div>
            */}
            {/* <NavItem
              label="Suporte"
              Icon={HelpCircle}
              link="/support"
              active={pathname === "/support"}
              collapsed={isSidebarCollapsed}
            /> */}
            <NavItem
              label="Configurações"
              Icon={Settings}
              link="/settings"
              active={pathname === "/settings"}
              collapsed={isSidebarCollapsed}
            />
          </div>

          {/* Usuário */}
          <div className="flex items-center justify-center bg-white/10 p-3 rounded-lg text-white text-sm">
            {isSidebarCollapsed ? (
              <Image
                src={komvos}
                alt="Avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Image
                    src={komvos}
                    alt="Avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-semibold">{session?.user?.name ?? "Usuário"}</div>
                    <div className="text-xs text-white/70">{session?.user?.email ?? "Email do usuário"}</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Configurações de conta</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link
                          href={process.env.NEXT_PUBLIC_KEYCLOAK_ACCOUNT_URL ?? "https://kc.statum.com.br/realms/KomvosMind/account/"}
                          target="_blank" // opcional
                          rel="noopener noreferrer"
                        >
                          Editar Perfil
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {/* <MoreVertical size={18} /> */}
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Toggle button */}
      <Button
        size="sm"
        className="h-8 w-8 p-0 rounded-full shadow-md border bg-sidebar text-sidebar-foreground self-start mt-8 -ml-4 z-10"
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      >
        {isSidebarCollapsed ? (
          <ChevronRight size={16} />
        ) : (
          <ChevronLeft size={16} />
        )}
      </Button>

      {/* Conteúdo da página */}
      <main className="flex-1 bg-background p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
