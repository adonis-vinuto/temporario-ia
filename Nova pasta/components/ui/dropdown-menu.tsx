"use client";

import { useState, useRef, useEffect } from "react";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export function DropdownMenu({ trigger, children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-10">
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownMenuItemProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "default" | "destructive";
}

export function DropdownMenuItem({
  onClick,
  children,
  variant = "default",
}: DropdownMenuItemProps) {
  return (
    <button
      className={`w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${
        variant === "destructive"
          ? "text-destructive hover:bg-destructive hover:text-destructive-foreground"
          : ""
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
