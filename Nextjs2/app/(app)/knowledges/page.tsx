"use client";

import { useQuery } from "@tanstack/react-query";
import { getKnowledges } from "./api/getKnowledges";
import { useModule } from "@/lib/context/ModuleContext";
import { CustomCard } from "@/components/ui/custom-card";
import { BookIcon } from "lucide-react";
import { OriginLabels } from "@/lib/enums/origin";
import CreateKnowledge from "@/components/createKnowledge";
import { useRouter } from "next/navigation";
import { ModuleLabels } from "@/lib/enums/module";

export default function KnowledgesPage() {
  const { currentModule } = useModule();
  const router = useRouter();

  const { data: knowledges, isLoading } = useQuery({
    queryKey: ["knowledges", currentModule],
    queryFn: () => getKnowledges(currentModule),
  });

  return (
    <div className="flex bg-background text-foreground">
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Conhecimentos</h2>
          <CreateKnowledge />
        </header>

        {isLoading ? (
          <p className="text-zinc-400">Carregando conhecimentos...</p>
        ) : knowledges?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {knowledges.map((knowledge) => (
              <CustomCard
                key={knowledge.idKnowledge}
                onClick={() =>
                  router.push(
                    `/knowledges/${ModuleLabels[currentModule]}/${knowledge.idKnowledge}`
                  )
                }
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center mb-3">
                    <BookIcon className="w-6 h-6 mr-3 text-primary" />
                    <h3 className="font-semibold text-lg">{knowledge.name}</h3>
                  </div>
                  {knowledge.description && (
                    <p className="text-gray-400 text-sm flex-1">
                      {knowledge.description}
                    </p>
                  )}
                  <div className="mt-4">
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {OriginLabels[knowledge.origin]}
                    </span>
                  </div>
                </div>
              </CustomCard>
            ))}
          </div>
        ) : (
          <p className="text-zinc-400">Nenhum conhecimento encontrado</p>
        )}
      </main>
    </div>
  );
}
