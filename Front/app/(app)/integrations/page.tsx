"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SeniorERPTab } from "@/components/integrations/SeniorERPTab";
import { SeniorHCMTab } from "@/components/integrations/SeniorHCMTab";
import { TwilioTab } from "@/components/integrations/TwilioTab";

export default function IntegrationsPage() {
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

          <TabsContent value="erp" className="mt-6">
            <SeniorERPTab />
          </TabsContent>

          <TabsContent value="hcm" className="mt-6">
            <SeniorHCMTab />
          </TabsContent>

          <TabsContent value="twilio" className="mt-6">
            <TwilioTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}