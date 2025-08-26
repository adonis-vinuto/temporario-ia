"use client";

import { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "./ui/card";

interface AgentCardProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  id?: string;
}

export default function AgentCard({
  Icon,
  title,
  description,
  id,
}: Readonly<AgentCardProps>) {
  const router = useRouter();

  return (
    <div className="relative group">
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-tr from-gradient-from to-gradient-to opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm z-0" />

      <Card
        onClick={() => router.push(`/agents/${id}`)}
        className="relative z-10 bg-card rounded-[20px] p-5 cursor-pointer transition-transform duration-200 group-hover:scale-[0.98] w-full h-full"
      >
        <div className="flex flex-col items-start gap-4 mb-3">
          <div className="flex items-center">
            <div className="text-3xl mr-2">
              <Icon size={36} />
            </div>
            <h3 className="font-semibold text-3xl">{title}</h3>
          </div>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </Card>
    </div>
  );
}
