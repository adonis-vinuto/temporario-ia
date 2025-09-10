"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import {
  DataConfigCreateSchema,
  TDataConfig,
  TDataConfigCreate,
} from "@/types/schemas/data-config";
import {
  createDataConfig,
  getDataConfig, // 👈 agora usamos função que retorna um único objeto
  updateDataConfig,
} from "@/lib/api/data-config";
;
import { ConfigRequiredModal } from "./_components/config-required-modal";

export default function SettingsPage() {

  const qc = useQueryClient();

  // Busca uma configuração (ou null)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["data-config"],
    queryFn: () => getDataConfig(),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  const existing: TDataConfig | null = data ?? null;

  const form = useForm<TDataConfigCreate>({
    resolver: zodResolver(DataConfigCreateSchema),
    defaultValues: {
      sqlHost: "",
      sqlPort: "",
      sqlUser: "",
      sqlPassword: "",
      sqlDatabase: "",
      blobConnectionString: "",
      blobContainerName: "",
    },
    mode: "onBlur",
  });

  // Preenche quando dados chegam
  useEffect(() => {
    if (!existing) return;
    form.reset({
      sqlHost: existing.sqlHost ?? "",
      sqlPort: existing.sqlPort ?? "",
      sqlUser: existing.sqlUser ?? "",
      sqlPassword: existing.sqlPassword ?? "",
      sqlDatabase: existing.sqlDatabase ?? "",
      blobConnectionString: existing.blobConnectionString ?? "",
      blobContainerName: existing.blobContainerName ?? "",
    });
  }, [existing, form]);

  const { mutate: saveCreate, isPending: creating } = useMutation({
    mutationFn: (payload: TDataConfigCreate) => createDataConfig(payload),
    onSuccess: async () => {
      toast.success("Configuração criada com sucesso!");
      await qc.invalidateQueries({ queryKey: ["data-config"] });
    },
    onError: (e: unknown) => {
      const msg =
        e instanceof Error ? e.message : "Erro ao criar configuração.";
      toast.error(msg);
    },
  });

  const { mutate: saveUpdate, isPending: updating } = useMutation({
    mutationFn: (payload: TDataConfigCreate) => {
      if (!existing) throw new Error("Sem ID para editar.");
      return updateDataConfig(existing.id, payload);
    },
    onSuccess: async () => {
      toast.success("Configuração atualizada com sucesso!");
      await qc.invalidateQueries({ queryKey: ["data-config"] });
    },
    onError: (e: unknown) => {
      const msg =
        e instanceof Error ? e.message : "Erro ao atualizar configuração.";
      toast.error(msg);
    },
  });

  const onSubmit = (values: TDataConfigCreate) => {
    if (existing) {
      saveUpdate(values);
    } else {
      saveCreate(values);
    }
  };

  const showBlockingModal = !isLoading && !isError && !existing;

  return (
    <div className="p-6 space-y-6">
      {showBlockingModal && <ConfigRequiredModal />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-sm text-muted-foreground">
            Informe os dados abaixo para habilitar as demais telas.
          </p>
        </div>
      </div>

      <Separator className="opacity-40" />

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Banco de Dados (SQL)</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">SQL Host</label>
            <Input
              {...form.register("sqlHost")}
              placeholder="ex: db.mycorp.com"
            />
            {form.formState.errors.sqlHost && (
              <p className="text-xs text-red-500">
                {form.formState.errors.sqlHost.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">SQL Port</label>
            <Input {...form.register("sqlPort")} placeholder="ex: 1433" />
            {form.formState.errors.sqlPort && (
              <p className="text-xs text-red-500">
                {form.formState.errors.sqlPort.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">SQL User</label>
            <Input {...form.register("sqlUser")} placeholder="ex: sa" />
            {form.formState.errors.sqlUser && (
              <p className="text-xs text-red-500">
                {form.formState.errors.sqlUser.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">SQL Password</label>
            <Input
              type="password"
              {...form.register("sqlPassword")}
              placeholder="********"
            />
            {form.formState.errors.sqlPassword && (
              <p className="text-xs text-red-500">
                {form.formState.errors.sqlPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">SQL Database</label>
            <Input {...form.register("sqlDatabase")} placeholder="ex: master" />
            {form.formState.errors.sqlDatabase && (
              <p className="text-xs text-red-500">
                {form.formState.errors.sqlDatabase.message}
              </p>
            )}
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Armazenamento (Opcional)</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Blob Connection String
            </label>
            <Input
              {...form.register("blobConnectionString")}
              placeholder="ex: DefaultEndpointsProtocol=...;"
            />
            {form.formState.errors.blobConnectionString && (
              <p className="text-xs text-red-500">
                {form.formState.errors.blobConnectionString.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Blob Container Name</label>
            <Input
              {...form.register("blobContainerName")}
              placeholder="ex: arquivos"
            />
            {form.formState.errors.blobContainerName && (
              <p className="text-xs text-red-500">
                {form.formState.errors.blobContainerName.message}
              </p>
            )}
          </div>
        </Card>

        <div className="md:col-span-2 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => form.reset()}
            disabled={creating || updating}
          >
            Limpar
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {existing
              ? updating
                ? "Salvando..."
                : "Salvar alterações"
              : creating
              ? "Criando..."
              : "Salvar"}
          </Button>
        </div>
      </form>

      {/* Se houve erro na busca inicial */}
      {isError && (
        <p className="text-sm text-red-500">
          {error instanceof Error
            ? error.message
            : "Falha ao carregar dados."}
        </p>
      )}
    </div>
  );
}
