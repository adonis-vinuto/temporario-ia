"use client";

import { Card } from "./card";

interface CustomCardProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function CustomCard({ children, onClick }: CustomCardProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-tr from-gradient-from to-gradient-to opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm z-0" />
      <Card
        onClick={onClick}
        className="relative z-10 bg-card rounded-[20px] p-5 cursor-pointer transition-transform duration-200 group-hover:scale-[0.98] w-full h-full"
      >
        {children}
      </Card>
    </div>
  );
}