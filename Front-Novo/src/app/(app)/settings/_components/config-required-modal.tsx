"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ConfigRequiredModal() {
  return (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configuração necessária</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Para utilizar a aplicação é necessário preencher a configuração inicial.
        </p>
        <div className="mt-4 flex justify-end">
          <Link href="/settings">
            <Button>Ir para Configuração</Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
