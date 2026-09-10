import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import pb from '@/lib/pocketbase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function InvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [acceptedRole, setAcceptedRole] = useState('');

  // Already logged in? No invite needed.
  useEffect(() => {
    if (pb.authStore.isValid) navigate('/', { replace: true });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await pb.send('/api/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name: name.trim(),
          password,
          passwordConfirm: confirmPassword,
        }),
      });
      // The accept route returns the account email — log straight in.
      const authData = await pb.collection('users').authWithPassword(res.email, password);
      setAcceptedRole(authData.record?.role ?? 'viewer');
      setAccepted(true);
    } catch (err: any) {
      setError(err?.message ?? 'This invite link is invalid or has already been used.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-md">
        {accepted ? (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="mb-1 text-2xl font-bold text-card-foreground">Welcome to the Fenrir dashboard!</h1>
              <p className="text-sm text-muted-foreground">
                Your account is ready. You have been given the <span className="font-medium text-foreground">{acceptedRole}</span> role.
              </p>
            </div>
            <Card className="gap-3 p-4">
              <h2 className="font-semibold text-card-foreground">What you can do</h2>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {acceptedRole === 'admin' && <li>View and manage all dashboard content, forms, responses and users.</li>}
                {acceptedRole === 'media' && <li>Edit years, sponsors, activities, categories and people, and manage forms and responses.</li>}
                {acceptedRole === 'formmanager' && <li>Create and edit forms and view form responses.</li>}
                {(acceptedRole === 'viewer' || !['admin', 'media', 'formmanager'].includes(acceptedRole)) && <li>View dashboard content, forms and form responses.</li>}
              </ul>
              {acceptedRole !== 'admin' && (
                <>
                  <h2 className="mt-2 font-semibold text-card-foreground">What you cannot do</h2>
                  <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    {acceptedRole === 'media' && <li>Delete records or manage dashboard users.</li>}
                    {acceptedRole === 'formmanager' && <li>Edit general site content, delete records or manage dashboard users.</li>}
                    {acceptedRole === 'viewer' && <li>Edit or delete content, manage forms or manage dashboard users.</li>}
                  </ul>
                </>
              )}
            </Card>
            <Button onClick={() => navigate('/', { replace: true })} className="w-full">Go to dashboard</Button>
          </div>
        ) : (
          <>
        <h1 className="mb-1 text-2xl font-bold text-card-foreground">You're invited!</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Set up your account — choose a display name and a password to access the dashboard.
        </p>

        {!token ? (
          <p className="text-sm text-destructive">This invite link is missing its token.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-name">Display name</Label>
              <Input
                id="invite-name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-password">Password</Label>
              <Input
                id="invite-password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-confirm">Confirm password</Label>
              <Input
                id="invite-confirm"
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Setting up…' : 'Create account & log in'}
            </Button>
          </form>
        )}
          </>
        )}
      </div>
    </div>
  );
}
