// components/ImportTab.tsx
"use client";

import { ExcelImport } from "@/components/ExcelImport";
import { HcmImport } from "@/components/HcmImport";
import { Module } from "@/lib/enums/module";

interface ImportTabProps {
  knowledgeId: string;
  module: Module;
}

export function ImportTab({ knowledgeId, module }: ImportTabProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Importação de Dados</h3>
        <p className="text-muted-foreground">
          Escolha a forma de importação que melhor se adequa às suas necessidades
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExcelImport knowledgeId={knowledgeId} />
        <HcmImport knowledgeId={knowledgeId} module={module} />
      </div>
    </div>
  );
}