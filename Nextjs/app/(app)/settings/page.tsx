import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="flex bg-background text-foreground">
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Configurações</h2>
        </header>

        <Tabs defaultValue="perfil" className="w-full">
          <TabsList className="grid w-fit grid-cols-3">
            <TabsTrigger
              value="perfil"
              className="rounded-l-xl rounded-r-none text-lg"
            >
              Perfil
            </TabsTrigger>
            <TabsTrigger value="banco-dados" className="rounded-none text-lg">
              Banco de dados
            </TabsTrigger>
            <TabsTrigger
              value="arquivos"
              className="rounded-r-xl rounded-l-none text-lg"
            >
              Arquivos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil">
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-4">Perfil</h3>
            </div>
          </TabsContent>

          <TabsContent value="banco-dados">
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-4">Banco de dados</h3>
            </div>
          </TabsContent>

          <TabsContent value="arquivos">
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-4">Arquivos</h3>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
