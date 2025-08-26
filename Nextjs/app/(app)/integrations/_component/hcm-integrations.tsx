"use client";

import { useQuery } from "@tanstack/react-query";
import { useModule } from "@/lib/context/ModuleContext";
import { CustomCard } from "@/components/ui/custom-card";
import { getHcmIntegrations } from "../api/hcm/getHcmIntegrations";

export default function HcmIntegrations() {
  const { currentModule } = useModule();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ["hcm-integrations", currentModule],
    queryFn: () => getHcmIntegrations(currentModule),
  });

  if (isLoading) {
    return <p className="text-zinc-400 mt-8">Carregando integrações HCM...</p>;
  }

  if (!integrations?.length) {
    return (
      <p className="text-zinc-400 mt-8">Nenhuma integração HCM encontrada</p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
      {integrations.map((integration) => (
        <CustomCard key={integration.idSeniorHcmConfig}>
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-3">
              <h3 className="font-semibold text-lg">Senior HCM</h3>
            </div>
            <div className="space-y-2 flex-1">
              <div>
                <p className="text-sm text-gray-500">Usuário</p>
                <p className="text-sm">{integration.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">URL WSDL</p>
                <p className="text-sm truncate" title={integration.wsdlUrl}>
                  {integration.wsdlUrl}
                </p>
              </div>
            </div>
          </div>
        </CustomCard>
      ))}
    </div>
  );
}
