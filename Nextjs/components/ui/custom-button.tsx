"use client";

import React from "react";

interface CustomButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function CustomButton({
  children,
  onClick,
  className = "",
}: Readonly<CustomButtonProps>) {
  return (
    <div className="relative group w-30 h-12">
      <div className="absolute inset-0 rounded-[15px] bg-gradient-to-tr from-gradient-from to-gradient-to opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm z-0" />

      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        className={`relative z-10 w-full h-full flex items-center justify-center gap-2 px-4 py-2 rounded-[15px] cursor-pointer transition-transform duration-200 group-hover:scale-[0.98] focus:outline-none text-card-foreground font-semibold bg-card overflow-hidden ${className}`}
      >
        <div
          aria-hidden
          className="absolute inset-0 rounded-[15px] p-[1px] bg-gradient-to-tr from-gradient-from to-gradient-to z-[-1]"
        >
          <div className="rounded-[14px] w-full h-full bg-card" />
        </div>
        {children}
      </div>
    </div>
  );
}
