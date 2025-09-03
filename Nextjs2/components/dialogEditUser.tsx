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
import { Pen } from 'lucide-react';
import { useState } from 'react';

interface EditUserDialogProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function DialogEditUser({ user }: EditUserDialogProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);

  const handleSave = () => {
    console.log('Updated:', { name, email, role });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Pen size={16} />
      </DialogTrigger>
      <DialogContent className='bg-zinc-950 text-white border border-zinc-700'>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
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
          <Button onClick={handleSave} className='mt-4 w-full'>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
