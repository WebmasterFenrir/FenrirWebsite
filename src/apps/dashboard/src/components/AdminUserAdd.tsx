import React, { useState } from 'react'
import pb from '../lib/pocketbase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const AdminUserAdd: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      await pb.collection('users').create({ email, password, passwordConfirm: password })
      setStatus({ ok: true, msg: 'User created successfully.' })
      setEmail('')
      setPassword('')
    } catch {
      setStatus({ ok: false, msg: 'Failed to create user. Email may already be in use.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-email">Email</Label>
        <Input
          id="new-email"
          type="email"
          placeholder="user@fenrirclub.be"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-password">Password</Label>
        <Input
          id="new-password"
          type="password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>
      {status && (
        <p className={`text-xs ${status.ok ? 'text-green-400' : 'text-destructive'}`}>
          {status.msg}
        </p>
      )}
      <Button type="submit" disabled={saving}>
        {saving ? 'Creating…' : 'Create User'}
      </Button>
    </form>
  )
}

export default AdminUserAdd
