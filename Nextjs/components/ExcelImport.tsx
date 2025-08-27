// components/ExcelImport.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, Download, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { importExcelData } from "@/app/(app)/knowledges/[module]/[id]/api/importApi";
import { ImportProgress, ImportStatus } from "@/components/ImportProgress";

interface ExcelImportProps {
  knowledgeId: string;
}

export function ExcelImport({ knowledgeId }: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    isImporting: false,
    progress: 0,
    currentStep: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validar se é um arquivo Excel
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: "Erro",
          description: "Por favor, selecione um arquivo Excel válido (.xlsx ou .xls)",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo Excel",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setImportStatus({
        isImporting: true,
        progress: 0,
        currentStep: "Preparando arquivo...",
      });
      
      const formData = new FormData();
      formData.append('file', file);
      
      // Simular progresso
      setImportStatus(prev => ({ ...prev, progress: 30, currentStep: "Validando dados..." }));
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular processamento
      
      setImportStatus(prev => ({ ...prev, progress: 60, currentStep: "Importando registros..." }));
      
      const result = await importExcelData(knowledgeId, formData);
      
      setImportStatus(prev => ({ 
        ...prev, 
        progress: 100, 
        currentStep: "Concluído!",
        success: true,
        recordsProcessed: result.recordsImported
      }));
      
      toast({
        title: "Sucesso",
        description: `${result.recordsImported} registros importados com sucesso!`,
      });
      
      // Limpar o arquivo selecionado
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Reset status após 3 segundos
      setTimeout(() => {
        setImportStatus({
          isImporting: false,
          progress: 0,
          currentStep: "",
        });
      }, 3000);
      
    } catch (error: unknown) {
      console.error("Erro ao importar arquivo:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Erro ao importar o arquivo";
      
      setImportStatus(prev => ({
        ...prev,
        isImporting: false,
        error: errorMessage,
      }));
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Reset status após 5 segundos
      setTimeout(() => {
        setImportStatus({
          isImporting: false,
          progress: 0,
          currentStep: "",
        });
      }, 5000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Download do arquivo de modelo da raiz
    const link = document.createElement('a');
    link.href = '/modelo-importacao.xlsx';
    link.download = 'modelo-importacao.xlsx';
    link.click();
  };

  return (
    <Card className="h-fit">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <FileSpreadsheet className="h-10 w-10 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle className="text-xl">Importar via Excel</CardTitle>
        <CardDescription>
          Faça upload de um arquivo Excel com os dados dos colaboradores
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botão para baixar modelo */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={handleDownloadTemplate}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar Modelo Excel
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Use este modelo como referência para formatar seus dados
          </p>
        </div>

        <div className="border-t pt-4">
          {/* Seleção de arquivo */}
          <div className="space-y-2">
            <Label htmlFor="excel-file">Arquivo Excel</Label>
            <Input
              id="excel-file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".xlsx,.xls"
              className="cursor-pointer"
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado: {file.name}
              </p>
            )}
          </div>

          {/* Botão de upload */}
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading}
            className="w-full mt-4 bg-blue-800 hover:bg-blue-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Importar Dados
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Formatos suportados: .xlsx, .xls</p>
          <p>• Tamanho máximo: 10MB</p>
          <p>• Use o modelo fornecido para garantir a formatação correta</p>
        </div>
      </CardContent>

      {/* Componente de progresso */}
      {(importStatus.isImporting || importStatus.success || importStatus.error) && (
        <div className="px-6 pb-6">
          <ImportProgress status={importStatus} />
        </div>
      )}
    </Card>
  );
}