import React, { useState } from 'react';
import pb from '../lib/pocketbase';

const AdminUserAdd: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create a new user in PocketBase users collection
      await pb.collection('users').create({
        email: email,
        password: password,
        passwordConfirm: password,
        // add other fields or role flag here as needed
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
    <div className="max-w-md p-4 border rounded shadow mt-6">
      <h3 className="text-xl font-semibold mb-4">Add Preasidiumleden User</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="p-2 border rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="p-2 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <button
          className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          type="submit"
        >
          Add User
        </button>
      </form>
      <p className="mt-2 text-sm">{status}</p>
    </div>
  );
};

export default AdminUserAdd;
