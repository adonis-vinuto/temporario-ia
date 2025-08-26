// app/(app)/knowledges/[module]/[id]/page.tsx
import { getKnowledgeById } from "./api/getKnowledge";
import { Module } from "@/lib/enums/module";
import { notFound } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmployeesTab } from "@/components/EmployeesTab";
import { SalaryHistoryTab } from "@/components/SalaryHistoryTab";
import { PayrollTab } from "@/components/PayrollTab";

export default async function KnowledgesPage({
  params,
}: {
  params: Promise<{ module: Module; id: string }>;
}) {
  const { id, module } = await params;

  try {
    const knowledge = await getKnowledgeById(module, id);

    if (!knowledge) {
      notFound();
    }

    return (
      <div className="flex bg-background text-foreground">
        <main className="flex-1 p-10 overflow-y-auto">
          <header className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold">{knowledge.name}</h2>
            </div>
          </header>

          <Tabs defaultValue="colaboradores" className="w-full">
            <TabsList className="grid w-fit grid-cols-3">
              <TabsTrigger
                value="colaboradores"
                className="rounded-l-xl rounded-r-none text-lg"
              >
                Colaboradores
              </TabsTrigger>
              <TabsTrigger
                value="historico-salario"
                className="rounded-none text-lg"
              >
                Histórico do salário
              </TabsTrigger>
              <TabsTrigger
                value="ficha-pagamentos"
                className="rounded-r-xl rounded-l-none text-lg"
              >
                Ficha de pagamentos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="colaboradores" className="mt-6">
              <EmployeesTab knowledgeId={id} />
            </TabsContent>

            <TabsContent value="historico-salario" className="mt-6">
              <SalaryHistoryTab knowledgeId={id} />
            </TabsContent>

            <TabsContent value="ficha-pagamentos" className="mt-6">
              <PayrollTab knowledgeId={id} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  } catch {
    return (
      <div className="flex bg-background text-foreground">
        <main className="flex-1 p-10 overflow-y-auto">
          <p className="text-red-400">Erro ao carregar conhecimento</p>
        </main>
      </div>
    );
  }
}