import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileForm from './ProfileForm';

interface ProfileSetupProps {
  user: any;
  onComplete: (updatedUser: any) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ user, onComplete }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-md">
        <h1 className="mb-1 text-2xl font-bold text-card-foreground">Welcome!</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Set up your profile before continuing — this only takes a moment.
        </p>
        <ProfileForm
          user={user}
          variant="setup"
          onDone={(updated) => {
            onComplete(updated);
            navigate('/');
          }}
        />
      </div>
    </div>
  );
};

export default ProfileSetup;
