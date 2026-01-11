import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PrayerRequest, PrayerTheme } from './usePrayers';

export function useMyPrayers() {
  const { user } = useAuth();
  const [prayingFor, setPrayingFor] = useState<PrayerRequest[]>([]);
  const [myRequests, setMyRequests] = useState<PrayerRequest[]>([]);
  const [themes, setThemes] = useState<PrayerTheme[]>([]);
  const [loadingPraying, setLoadingPraying] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const fetchThemes = useCallback(async () => {
    const { data } = await supabase
      .from('prayer_themes')
      .select('*')
      .order('display_order');
    setThemes(data || []);
  }, []);

  // Fetch prayers the user is praying for
  const fetchPrayingFor = useCallback(async () => {
    if (!user) {
      setPrayingFor([]);
      setLoadingPraying(false);
      return;
    }

    setLoadingPraying(true);
    try {
      // Get user's prayers
      const { data: userPrayersData, error: userPrayersError } = await supabase
        .from('user_prayers')
        .select('prayer_request_id')
        .eq('user_id', user.id);

      if (userPrayersError) throw userPrayersError;

      if (!userPrayersData || userPrayersData.length === 0) {
        setPrayingFor([]);
        return;
      }

      const prayerIds = userPrayersData.map(up => up.prayer_request_id);

      // Fetch the prayer requests
      const { data: prayersData, error: prayersError } = await supabase
        .from('prayer_requests')
        .select('*')
        .in('id', prayerIds)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (prayersError) throw prayersError;

      // Get authors
      const userIds = [...new Set((prayersData || []).map(p => p.user_id))];
      let profilesMap: Record<string, { display_name: string | null; photo_url: string | null; verified: boolean | null }> = {};

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('public_profiles')
          .select('id, display_name, photo_url, verified')
          .in('id', userIds);

        if (profilesData) {
          profilesData.forEach(profile => {
            if (profile.id) {
              profilesMap[profile.id] = {
                display_name: profile.display_name,
                photo_url: profile.photo_url,
                verified: profile.verified
              };
            }
          });
        }
      }

      // Get prayer counts
      const { data: countsData } = await supabase
        .from('user_prayers')
        .select('prayer_request_id')
        .in('prayer_request_id', prayerIds);

      const prayerCounts: Record<string, number> = {};
      if (countsData) {
        countsData.forEach(up => {
          prayerCounts[up.prayer_request_id] = (prayerCounts[up.prayer_request_id] || 0) + 1;
        });
      }

      const formattedPrayers: PrayerRequest[] = (prayersData || []).map(prayer => ({
        id: prayer.id,
        user_id: prayer.user_id,
        title: prayer.title,
        description: prayer.description,
        theme_id: prayer.theme_id,
        is_anonymous: prayer.is_anonymous || false,
        is_pinned: prayer.is_pinned || false,
        is_deleted: prayer.is_deleted || false,
        created_at: prayer.created_at,
        prayer_count: prayerCounts[prayer.id] || 0,
        has_prayed: true,
        author: prayer.is_anonymous ? undefined : profilesMap[prayer.user_id] || { display_name: 'App da Oração', photo_url: null, verified: false }
      }));

      setPrayingFor(formattedPrayers);
    } catch (error) {
      console.error('Error fetching prayers:', error);
      toast.error('Erro ao carregar orações');
    } finally {
      setLoadingPraying(false);
    }
  }, [user]);

  // Fetch user's own prayer requests
  const fetchMyRequests = useCallback(async () => {
    if (!user) {
      setMyRequests([]);
      setLoadingRequests(false);
      return;
    }

    setLoadingRequests(true);
    try {
      const { data: prayersData, error: prayersError } = await supabase
        .from('prayer_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (prayersError) throw prayersError;

      // Get prayer counts
      const prayerIds = (prayersData || []).map(p => p.id);
      const prayerCounts: Record<string, number> = {};

      if (prayerIds.length > 0) {
        const { data: countsData } = await supabase
          .from('user_prayers')
          .select('prayer_request_id')
          .in('prayer_request_id', prayerIds);

        if (countsData) {
          countsData.forEach(up => {
            prayerCounts[up.prayer_request_id] = (prayerCounts[up.prayer_request_id] || 0) + 1;
          });
        }
      }

      // Check if user has prayed for their own requests
      let userPrayers: Set<string> = new Set();
      if (prayerIds.length > 0) {
        const { data: userPrayersData } = await supabase
          .from('user_prayers')
          .select('prayer_request_id')
          .eq('user_id', user.id)
          .in('prayer_request_id', prayerIds);

        if (userPrayersData) {
          userPrayersData.forEach(up => userPrayers.add(up.prayer_request_id));
        }
      }

      const formattedPrayers: PrayerRequest[] = (prayersData || []).map(prayer => ({
        id: prayer.id,
        user_id: prayer.user_id,
        title: prayer.title,
        description: prayer.description,
        theme_id: prayer.theme_id,
        is_anonymous: prayer.is_anonymous || false,
        is_pinned: prayer.is_pinned || false,
        is_deleted: prayer.is_deleted || false,
        created_at: prayer.created_at,
        prayer_count: prayerCounts[prayer.id] || 0,
        has_prayed: userPrayers.has(prayer.id),
        author: { display_name: 'Você', photo_url: null, verified: false }
      }));

      setMyRequests(formattedPrayers);
    } catch (error) {
      console.error('Error fetching my requests:', error);
      toast.error('Erro ao carregar seus pedidos');
    } finally {
      setLoadingRequests(false);
    }
  }, [user]);

  const stopPraying = useCallback(async (prayerId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('user_prayers')
        .delete()
        .eq('user_id', user.id)
        .eq('prayer_request_id', prayerId);

      setPrayingFor(prev => prev.filter(p => p.id !== prayerId));
      toast.success('Oração removida');
    } catch (error) {
      console.error('Error removing prayer:', error);
      toast.error('Erro ao remover oração');
    }
  }, [user]);

  const deleteRequest = useCallback(async (prayerId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('prayer_requests')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', prayerId)
        .eq('user_id', user.id);

      setMyRequests(prev => prev.filter(p => p.id !== prayerId));
      toast.success('Pedido excluído');
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Erro ao excluir pedido');
    }
  }, [user]);

  const refresh = useCallback(() => {
    fetchPrayingFor();
    fetchMyRequests();
  }, [fetchPrayingFor, fetchMyRequests]);

  useEffect(() => {
    fetchThemes();
    fetchPrayingFor();
    fetchMyRequests();
  }, [fetchThemes, fetchPrayingFor, fetchMyRequests]);

  return {
    prayingFor,
    myRequests,
    themes,
    loadingPraying,
    loadingRequests,
    stopPraying,
    deleteRequest,
    refresh
  };
}
