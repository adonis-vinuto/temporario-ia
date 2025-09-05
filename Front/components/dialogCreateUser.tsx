'use client';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function DialogCreateUser() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  const handleCreate = () => {
    console.log('User created:', { name, email, role });
    // Aqui você pode chamar uma API ou atualizar estado global
  };

  return (
    <Dialog>
      <DialogTrigger className='border px-3 py-1 rounded hover:bg-zinc-800 text-sm'>
        + Add User
      </DialogTrigger>
      <DialogContent className='bg-zinc-950 text-white border border-zinc-700'>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor='role'>Role</Label>
            <Input
              id='role'
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          <Button onClick={handleCreate} className='mt-4 w-full'>
            Create User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
