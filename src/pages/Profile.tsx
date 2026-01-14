import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loading } from '@/components/ui/loading';
import { ProfileHeader, ProfileStats, ProfileActions, ProfileTags } from '@/components/profile';

interface Profile {
  id: string;
  display_name: string | null;
  photo_url: string | null;
  verified: boolean | null;
  created_at: string;
}

interface Subscription {
  status: string;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSupporter, setIsSupporter] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Check if admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      setIsAdmin(!!roleData);

      // Check if monthly supporter
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      setIsSupporter(!!subscriptionData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (authLoading || loading) {
    return <Loading text="Carregando perfil..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return <Loading text="Carregando perfil..." />;
  }

  return (
    <div className="space-y-6">
      <ProfileHeader
        userId={profile.id}
        displayName={profile.display_name}
        photoUrl={profile.photo_url}
        email={user.email || ''}
        verified={profile.verified ?? false}
        isSupporter={isSupporter}
        onUpdate={fetchProfile}
      />

      <ProfileTags
        isSupporter={isSupporter}
        isVerified={profile.verified ?? false}
      />

      <ProfileStats
        userId={profile.id}
        createdAt={profile.created_at}
      />

      <ProfileActions isAdmin={isAdmin} />
    </div>
  );
}
