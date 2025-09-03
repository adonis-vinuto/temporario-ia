// components/HcmImport.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Database, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Module } from "@/lib/enums/module";
import { SeniorHcmIntegration } from "@/lib/interface/SeniorHcmIntegration";
import { getSeniorHCMConfigs } from "@/app/(app)/integrations/api/seniorHCMApi";
import { 
  testHcmConnection, 
  importHcmData 
} from "@/app/(app)/knowledges/[module]/[id]/api/hcmImportApi";

interface HcmImportProps {
  knowledgeId: string;
  module: Module;
}

type ImportStep = 'select' | 'connecting' | 'connected' | 'importing' | 'completed' | 'error';

export function HcmImport({ knowledgeId, module }: HcmImportProps) {
  const [integrations, setIntegrations] = useState<SeniorHcmIntegration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<ImportStep>('select');
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadIntegrations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getSeniorHCMConfigs(module);
      setIntegrations(data);
    } catch (error: unknown) {
      console.error("Erro ao carregar integrações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as integrações HCM",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [module, toast]);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  const handleTestConnection = async () => {
    if (!selectedIntegration) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma integração",
        variant: "destructive",
      });
      return;
    }

    try {
      setCurrentStep('connecting');
      setErrorMessage("");
      
      await testHcmConnection(selectedIntegration);
      
      setCurrentStep('connected');
      toast({
        title: "Sucesso",
        description: "Conexão estabelecida com sucesso!",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao conectar com o HCM Senior";
      console.error("Erro ao testar conexão:", error);
      setCurrentStep('error');
      setErrorMessage(errorMessage);
      toast({
        title: "Erro",
        description: "Falha na conexão com o HCM Senior",
        variant: "destructive",
      });
    }
  };

  const handleImportData = async () => {
    if (!selectedIntegration) return;

    try {
      setCurrentStep('importing');
      setErrorMessage("");
      
      await importHcmData(knowledgeId, selectedIntegration);
      
      setCurrentStep('completed');
      toast({
        title: "Sucesso",
        description: "Dados importados com sucesso do HCM Senior!",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao importar dados do HCM Senior";
      console.error("Erro ao importar dados:", error);
      setCurrentStep('error');
      setErrorMessage(errorMessage);
      toast({
        title: "Erro",
        description: "Falha na importação dos dados",
        variant: "destructive",
      });
    }
  };

  const resetImport = () => {
    setCurrentStep('select');
    setSelectedIntegration("");
    setErrorMessage("");
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 'connecting':
      case 'importing':
        return <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />;
      case 'connected':
      case 'completed':
        return <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />;
      case 'error':
        return <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />;
      default:
        return <Database className="h-10 w-10 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'connecting':
        return 'Conectando...';
      case 'connected':
        return 'Conectado com Sucesso';
      case 'importing':
        return 'Importando Dados...';
      case 'completed':
        return 'Importação Concluída';
      case 'error':
        return 'Erro na Operação';
      default:
        return 'Importar via HCM Senior';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'connecting':
        return 'Testando conexão com o sistema HCM Senior';
      case 'connected':
        return 'Conexão estabelecida. Pronto para importar os dados';
      case 'importing':
        return 'Buscando e processando dados do HCM Senior';
      case 'completed':
        return 'Todos os dados foram importados com sucesso';
      case 'error':
        return errorMessage;
      default:
        return 'Importe dados diretamente do sistema HCM Senior';
    }
  };

  if (isLoading) {
    return (
      <Card className="h-fit">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Carregando integrações...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          {getStepIcon()}
        </div>
        <CardTitle className="text-xl">{getStepTitle()}</CardTitle>
        <CardDescription>
          {getStepDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentStep === 'select' && (
          <>
            {integrations.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  Nenhuma integração HCM configurada
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Configure uma integração na seção de Integrações
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selecionar Integração</label>
                  <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha uma integração HCM" />
                    </SelectTrigger>
                    <SelectContent>
                      {integrations.map((integration) => (
                        <SelectItem 
                          key={integration.idSeniorHcmConfig} 
                          value={integration.idSeniorHcmConfig}
                        >
                          {integration.username} - {integration.wsdlUrl}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleTestConnection}
                  disabled={!selectedIntegration}
                  className="w-full bg-blue-800 hover:bg-blue-700"
                >
                  Testar Conexão
                </Button>
              </>
            )}
          </>
        )}

        {currentStep === 'connected' && (
          <Button 
            onClick={handleImportData}
            className="w-full bg-blue-800 hover:bg-blue-700"
          >
            Importar Dados do HCM
          </Button>
        )}

        {(currentStep === 'completed' || currentStep === 'error') && (
          <Button 
            onClick={resetImport}
            variant="outline"
            className="w-full"
          >
            Nova Importação
          </Button>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Importa dados diretamente do sistema HCM Senior</p>
          <p>• Conexão segura via WSDL</p>
          <p>• Processamento automático dos dados</p>
        </div>
      </CardContent>
    </Card>
  );
}