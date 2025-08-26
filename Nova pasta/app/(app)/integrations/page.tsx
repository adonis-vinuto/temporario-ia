import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CreateIntegration from "./_component/create-integration";
import ErpIntegrations from "./_component/erp-integrations";
import HcmIntegrations from "./_component/hcm-integrations";
import TwilioIntegrations from "./_component/twilio-integrations";

export default function IntegrationsPage() {
  return (
    <div className="flex bg-background text-foreground">
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Integrações</h2>
          <CreateIntegration />
        </header>

        <Tabs defaultValue="perfil" className="w-full">
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
            <ErpIntegrations />
          </TabsContent>

          <TabsContent value="hcm">
            <HcmIntegrations />
          </TabsContent>

          <TabsContent value="twilio">
            <TwilioIntegrations />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
