// Nextjs/app/(app)/integrations/page.tsx

"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

//import { RefreshButton } from "@/components/RefreshButton";
//import { useModalCleanup } from "@/lib/utils/modal-cleanup";

export default function IntegrationsPage() {
  // Ativa limpeza de emergência com Ctrl+Shift+L
  //useModalCleanup();

  return (
    <div className="flex bg-background text-foreground">
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Integrações</h2>
        </header>

        <Tabs defaultValue="erp" className="w-full">
          <TabsList className="grid w-fit grid-cols-3">
            <TabsTrigger
              value="erp"
              className="rounded-l-xl rounded-r-none text-lg"
            >
              Senior ERP
            </TabsTrigger>
            <TabsTrigger value="hcm" className="rounded-none text-lg">
              Senior HCM
            </TabsTrigger>
            <TabsTrigger
              value="twilio"
              className="rounded-r-xl rounded-l-none text-lg"
            >
              Twilio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="erp">
            
          </TabsContent>

          <TabsContent value="hcm">
            
          </TabsContent>

          <TabsContent value="twilio">
            
          </TabsContent>
        </Tabs>
        
        {/* Botão de emergência - remover após resolver o problema */}
        {/* <RefreshButton /> */}
      </main>
    </div>
  );
}