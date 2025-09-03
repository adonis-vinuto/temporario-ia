// // Nextjs/components/RefreshButton.tsx

// "use client";

// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { RefreshCw } from 'lucide-react';

// /**
//  * Botão de emergência para refresh da página
//  * Use temporariamente para debug de problemas com modais
//  */
// export function RefreshButton() {
//   const router = useRouter();

//   const handleRefresh = () => {
//     // Limpa modais órfãos antes do refresh
//     const portals = document.querySelectorAll('[data-radix-portal]');
//     portals.forEach(portal => portal.remove());
    
//     // Força refresh do router
//     router.refresh();
    
//     // Se ainda não funcionar, faça hard refresh após 500ms
//     setTimeout(() => {
//       const modalsStillExist = document.querySelectorAll('[data-radix-portal]').length > 0;
//       if (modalsStillExist) {
//         window.location.reload();
//       }
//     }, 500);
//   };

//   // Só mostra em desenvolvimento
//   if (process.env.NODE_ENV === 'production') return null;

//   return (
//     <div className="fixed bottom-4 left-4 z-[9999]">
//       <Button
//         onClick={handleRefresh}
//         variant="destructive"
//         size="sm"
//         className="shadow-lg"
//         title="Refresh e limpar modais (Dev only)"
//       >
//         <RefreshCw className="mr-2 h-4 w-4" />
//         Refresh
//       </Button>
//     </div>
//   );
// }

// // Adicione ao seu layout ou página de integrações:
// // import { RefreshButton } from '@/components/RefreshButton';
// // <RefreshButton />