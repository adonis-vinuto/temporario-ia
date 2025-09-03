'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AgentType, AgentTypeLabel } from '@/lib/enums/agentType';

interface Documento {
  titulo: string;
  descricao: string;
  tooltip: string;
  agent_type: AgentType;
}

interface Props {
  documentos: Documento[];
  tipoAgente: AgentType;
}

export default function DocumentList({ documentos, tipoAgente }: Props) {
  return (
    <div className='space-y-4'>
      <h3 className='text-xl font-semibold mb-2'></h3>
      <TooltipProvider>
        {documentos
          .filter((doc) => doc.agent_type === tipoAgente)
          .map((doc, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div className='cursor-pointer p-3 border border-zinc-700 rounded hover:bg-zinc-800 transition'>
                  <p className='text-white font-medium'>{doc.titulo}</p>
                  <p className='text-sm text-zinc-400'>{doc.descricao}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent side='right' className='max-w-xs'>
                {doc.tooltip}
              </TooltipContent>
            </Tooltip>
          ))}
      </TooltipProvider>
    </div>
  );
}
