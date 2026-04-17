import React, { useState } from 'react';
import pb from '../lib/pocketbase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const AdminUserAdd: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pb.collection('users').create({
        email: email,
        password: password,
        passwordConfirm: password,
      });
      setStatus('User created successfully');
      setEmail('');
      setPassword('');
    } catch (error) {
      setStatus('Failed to create user');
      console.error(error);
    }
  };

  return (
    <div className="max-w-md p-6 border rounded shadow mt-6">
      <h3 className="text-xl font-semibold mb-4">Add Preasidiumleden User</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <Button type="submit">Add User</Button>
      </form>
      {status && <p className="mt-2 text-sm">{status}</p>}
    </div>
  );
};

export default AdminUserAdd;
