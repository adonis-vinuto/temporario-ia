// // Nextjs/lib/utils/modal-cleanup.ts

// import { useEffect } from 'react';

// /**
//  * Função de emergência para limpar todos os overlays do DOM
//  * Use apenas se os modais estiverem travando a tela
//  */
// export function cleanupAllModals() {
//   // Remove todos os overlays do Radix
//   const overlays = document.querySelectorAll('[data-radix-portal]');
//   overlays.forEach(overlay => overlay.remove());
  
//   // Remove elementos com z-index alto que podem estar bloqueando
//   const highZIndexElements = document.querySelectorAll('[style*="z-index"]');
//   highZIndexElements.forEach(el => {
//     const zIndex = parseInt(window.getComputedStyle(el).zIndex);
//     if (zIndex >= 50) {
//       el.remove();
//     }
//   });
  
//   // Remove classes do body que podem estar travando scroll
//   document.body.style.overflow = '';
//   document.body.style.pointerEvents = '';
//   document.body.classList.remove('pointer-events-none');
  
//   // Remove atributos data-scroll-locked
//   document.documentElement.removeAttribute('data-scroll-locked');
//   document.body.removeAttribute('data-scroll-locked');
  
//   console.log('Limpeza de modais executada');
// }

// /**
//  * Hook para adicionar botão de emergência (apenas em desenvolvimento)
//  */
// export function useModalCleanup() {
//   useEffect(() => {
//     if (process.env.NODE_ENV === 'development') {
//       const handleKeyDown = (e: KeyboardEvent) => {
//         // Ctrl + Shift + L para limpar modais
//         if (e.ctrlKey && e.shiftKey && e.key === 'L') {
//           cleanupAllModals();
//           console.log('Limpeza de emergência ativada');
//         }
//       };
      
//       window.addEventListener('keydown', handleKeyDown);
//       return () => window.removeEventListener('keydown', handleKeyDown);
//     }
//   }, []);
// }

// /**
//  * Componente de botão de emergência (apenas em desenvolvimento)
//  */
// export function ModalCleanupButton() {
//   if (process.env.NODE_ENV !== 'development') return null;
  
//   return (
//     <button
//       onClick={cleanupAllModals}
//       style={{
//         position: 'fixed',
//         bottom: '10px',
//         right: '10px',
//         zIndex: 99999,
//         padding: '8px 12px',
//         backgroundColor: '#ff4444',
//         color: 'white',
//         border: 'none',
//         borderRadius: '4px',
//         fontSize: '12px',
//         cursor: 'pointer',
//         display: 'none', // Altere para 'block' se precisar do botão visível
//       }}
//       title="Limpar todos os modais (Emergência)"
//     >
//       🧹 Limpar Modais
//     </button>
//   );
// }

// /**
//  * Wrapper seguro para modais que garante limpeza
//  */
// export function SafeModalWrapper({ 
//   children, 
//   isOpen,
//   onClose 
// }: { 
//   children: React.ReactNode;
//   isOpen: boolean;
//   onClose: () => void;
// }) {
//   useEffect(() => {
//     // Limpa ao desmontar
//     return () => {
//       if (!isOpen) {
//         setTimeout(() => {
//           const portals = document.querySelectorAll('[data-radix-portal]');
//           if (portals.length > 0 && !document.querySelector('[data-state="open"]')) {
//             portals.forEach(p => p.remove());
//           }
//         }, 100);
//       }
//     };
//   }, [isOpen]);
  
//   if (!isOpen) return null;
  
//   return <>{children}</>;
// }

// // Adicione ao seu componente principal ou layout:
// // import { useModalCleanup } from '@/lib/utils/modal-cleanup';
// // useModalCleanup(); // Ativa Ctrl+Shift+L para limpeza de emergência