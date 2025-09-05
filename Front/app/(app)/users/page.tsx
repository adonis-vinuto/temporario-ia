// import DialogCreateUser from '@/components/dialogCreateUser';
import DialogEditUser from "@/components/dialogEditUser";

export default async function UsersPage() {
  const users = [
    {
      name: "Administrador",
      email: "admin@statum.com.br",
      role: "Admin",
      lastLogin: "Minutos atrás",
    },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      <main className="flex-1 p-6 overflow-y-auto">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Users</h2>
          {/* <DialogCreateUser /> */}
        </header>

        <div className="grid gap-4">
          {users?.map((user: any, i: number) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-background rounded"
            >
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-xs text-zinc-400">
                  {user.email} • {user.role}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <span>{user.lastLogin}</span>
                <button className="hover:text-foreground">
                  <DialogEditUser user={user} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
