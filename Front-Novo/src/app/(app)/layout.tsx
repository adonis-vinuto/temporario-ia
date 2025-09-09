"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  FileText, 
  BookOpen, 
  Cable, 
  Settings,
  LogOut 
} from "lucide-react";
import logout from "@/lib/utils/logout";

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Agentes", href: "/agents", icon: Users },
  { title: "Arquivos", href: "/files", icon: FileText },
  { title: "Conhecimentos", href: "/knowledges", icon: BookOpen },
  { title: "Integrações", href: "/integrations", icon: Cable },
  { title: "Configurações", href: "/settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await logout();
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r transition-all duration-300`}>
        {/* Logo */}
        <div className="h-16 border-b flex items-center px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              K
            </div>
            {sidebarOpen && (
              <div>
                <div className="font-bold">KOMVOS</div>
                <div className="text-xs text-gray-500">MIND</div>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href="#"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors
                  ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}
                  ${!sidebarOpen ? 'justify-center' : ''}
                  opacity-50 cursor-not-allowed`}
                onClick={(e) => e.preventDefault()}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 w-full border-t p-4">
          {sidebarOpen ? (
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium">{session?.user?.name || "Usuário"}</div>
                <div className="text-xs text-gray-500">{session?.user?.email || "email@exemplo.com"}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center text-red-600 hover:text-red-700"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}