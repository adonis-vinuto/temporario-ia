"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function SidebarToggle({ className }: { className?: string }) {
  const { open, toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-9 w-9", className)}
      onClick={toggleSidebar}
    >
      <ChevronLeft
        className={cn(
          "h-4 w-4 transition-transform duration-200",
          !open && "rotate-180"
        )}
      />
      <span className="sr-only">
        {open ? "Recolher menu" : "Expandir menu"}
      </span>
    </Button>
  );
}