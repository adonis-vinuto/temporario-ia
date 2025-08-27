// components/ImportProgress.tsx
"use client";

import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface ImportStatus {
  isImporting: boolean;
  progress: number;
  currentStep: string;
  error?: string;
  success?: boolean;
  recordsProcessed?: number;
  totalRecords?: number;
}

interface ImportProgressProps {
  status: ImportStatus;
}

export function ImportProgress({ status }: ImportProgressProps) {
  if (!status.isImporting && !status.success && !status.error) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        {status.isImporting && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="font-medium">Importando dados...</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{status.currentStep}</span>
                {status.recordsProcessed && status.totalRecords && (
                  <span>{status.recordsProcessed}/{status.totalRecords}</span>
                )}
              </div>
              
              {/* Barra de progresso simples com CSS */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${status.progress}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {status.progress.toFixed(0)}% concluído
              </p>
            </div>
          </div>
        )}

        {status.success && (
          <div className="flex items-start space-x-3 p-4 border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-green-800 dark:text-green-200">
                Importação concluída com sucesso!
              </h4>
              {status.recordsProcessed && (
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {status.recordsProcessed} registro(s) processado(s).
                </p>
              )}
            </div>
          </div>
        )}

        {status.error && (
          <div className="flex items-start space-x-3 p-4 border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-800 dark:text-red-200">
                Erro na importação
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {status.error}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}