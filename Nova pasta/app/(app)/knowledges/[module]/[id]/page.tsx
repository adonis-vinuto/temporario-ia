import { getKnowledgeById } from "./api/getKnowledge";
import { Module } from "@/lib/enums/module";
import { notFound } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

          <Tabs defaultValue="importacoes" className="w-full">
            <TabsList className="grid w-fit grid-cols-4">
              <TabsTrigger
                value="importacoes"
                className="rounded-l-xl rounded-r-none text-lg"
              >
                Importações
              </TabsTrigger>
              <TabsTrigger
                value="colaboradores"
                className="rounded-none text-lg"
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

            <TabsContent value="importacoes">
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-4">Importações</h3>
              </div>
            </TabsContent>

            <TabsContent value="colaboradores">
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-4">Colaboradores</h3>
              </div>
            </TabsContent>

            <TabsContent value="historico-salario">
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-4">
                  Histórico do salário
                </h3>
              </div>
            </TabsContent>

            <TabsContent value="ficha-pagamentos">
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-4">
                  Ficha de pagamentos
                </h3>
              </div>
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
