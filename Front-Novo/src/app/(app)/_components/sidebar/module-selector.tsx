// src/app/(app)/_components/sidebar/module-selector.tsx
"use client";

import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useModuleStore } from "@/lib/context/use-module-store";
import { Module, ModuleLabels } from "@/types/enums/module";
import { IisSidebarOpen } from "@/types/interfaces/sidebar.intf";

export function ModuleSelector({ isOpen }: IisSidebarOpen) {
  const { module, setModule } = useModuleStore();

  if (!isOpen) return null;

  return (
    <div className="px-3 pb-3">
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
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 transition-colors
                data-[highlighted]:bg-white data-[highlighted]:text-card-foreground
                focus:bg-white focus:text-card-foreground"
            >
              {ModuleLabels[m]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
