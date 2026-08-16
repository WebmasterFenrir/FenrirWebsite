import React, { useState, useRef, useEffect } from 'react';
import pb from '@/lib/pocketbase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileFormProps {
  user: any;
  onDone: (updatedUser: any) => void;
  /** 'setup' = forced first-login onboarding, 'profile' = editable account page */
  variant?: 'setup' | 'profile';
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  media: 'Media',
  viewer: 'Viewer',
  formmanager: 'Formmanager',
};

const ProfileForm: React.FC<ProfileFormProps> = ({ user, onDone, variant = 'profile' }) => {
  const isSetup = variant === 'setup';

  // Onboarding default: prefill the name from the email local-part so a new
  // user only has to confirm it, not invent one from scratch.
  const [name, setName] = useState(
    isSetup && !user.name && user.email ? user.email.split('@')[0] : (user.name ?? '')
  );
  // Password change is opt-in — a fresh account doesn't need to touch it.
  const [changePassword, setChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke object URLs so the browser doesn't leak memory on every pick.
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const currentAvatarUrl =
    !avatarFile && user?.avatar ? pb.files.getURL(user, user.avatar) : null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (changePassword) {
      if (!currentPassword) {
        setError('Enter your current password.');
        return;
      }
      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      if (changePassword) {
        formData.append('oldPassword', currentPassword);
        formData.append('password', newPassword);
        formData.append('passwordConfirm', confirmPassword);
      }

      const updated = await pb.collection('users').update(user.id, formData);

      // Refresh the session so the auth store (and the sidebar name/avatar)
      // reflect the saved values. After a password change the old token dies,
      // so log back in with the new password instead.
      if (changePassword) {
        await pb.collection('users').authWithPassword(user.email, newPassword);
      } else {
        await pb.collection('users').authRefresh();
      }

      onDone(updated);
      if (isSetup) {
        // The setup wrapper navigates away on completion.
      } else {
        setSaved(true);
        setChangePassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarFile(null);
        setAvatarPreview(null);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative size-24 overflow-hidden rounded-full border-2 border-border bg-muted transition hover:border-primary"
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar preview" className="size-full object-cover" />
          ) : currentAvatarUrl ? (
            <img src={currentAvatarUrl} alt="Current avatar" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-3xl text-muted-foreground group-hover:text-foreground">
              +
            </span>
          )}
        </button>
        <span className="text-xs text-muted-foreground">Click to upload a profile picture</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Display name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />
      </div>

      {/* Password (opt-in) */}
      <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
        <div className="flex items-center gap-2">
          <input
            id="change-password"
            type="checkbox"
            checked={changePassword}
            onChange={(e) => setChangePassword(e.target.checked)}
            className="size-4 rounded border-input"
          />
          <Label htmlFor="change-password" className="text-sm font-medium cursor-pointer">
            Change password
          </Label>
        </div>
        {!changePassword && (
          <p className="-mt-2 text-xs text-muted-foreground">
            {isSetup
              ? 'A board member set your login password — you can leave it as is and change it later from your profile.'
              : 'Leave unchecked to keep your current password.'}
          </p>
        )}
        {changePassword && (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      {isSetup && user?.role && (
        <p className="-mt-2 text-xs text-muted-foreground">
          You're signed in as a{' '}
          <span className="font-medium text-foreground">{ROLE_LABELS[user.role] ?? user.role}</span>.
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {saved && <p className="text-sm text-emerald-600">Profile saved.</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving…' : isSetup ? 'Save & Continue' : 'Save changes'}
      </Button>
    </form>
  );
};

export default ProfileForm;
