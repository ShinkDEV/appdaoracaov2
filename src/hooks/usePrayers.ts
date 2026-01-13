import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PrayerRequest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  theme_id: string;
  is_anonymous: boolean;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: string;
  prayer_count: number;
  has_prayed: boolean;
  author?: {
    display_name: string | null;
    photo_url: string | null;
    verified: boolean | null;
  } | undefined;
}

export interface PrayerTheme {
  id: string;
  name: string;
  icon: string | null;
  display_order: number;
}

interface UsePrayersOptions {
  themeFilter?: string;
  searchQuery?: string;
  limit?: number;
}

export function usePrayers(options: UsePrayersOptions = {}) {
  const { user } = useAuth();
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [themes, setThemes] = useState<PrayerTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  const pageSize = options.limit || 10;

  const fetchThemes = useCallback(async () => {
    const { data, error } = await supabase
      .from('prayer_themes')
      .select('*')
      .order('display_order');
    
    if (error) {
      console.error('Error fetching themes:', error);
      return;
    }
    
    setThemes(data || []);
  }, []);

  const fetchPrayers = useCallback(async (pageNum: number, append = false) => {
    if (pageNum === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // Use the public_prayer_requests view which hides user_id for anonymous requests
      let query = supabase
        .from('public_prayer_requests')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);

      if (options.themeFilter && options.themeFilter !== 'all') {
        query = query.eq('theme_id', options.themeFilter);
      }

      if (options.searchQuery) {
        query = query.or(`title.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`);
      }

      const { data: prayerData, error: prayerError } = await query;

      if (prayerError) {
        console.error('Error fetching prayers:', prayerError);
        toast.error('Erro ao carregar pedidos de oração');
        return;
      }

      // Get unique user IDs for fetching profiles (only non-null, non-anonymous)
      const userIds = [...new Set((prayerData || []).filter(p => p.user_id).map(p => p.user_id as string))];
      
      // Fetch profiles for authors
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

      // Get prayer counts using secure RPC function (doesn't expose who prayed)
      const prayerIds = prayerData?.map(p => p.id) || [];
      
      let prayerCounts: Record<string, number> = {};
      let userPrayers: Set<string> = new Set();

      if (prayerIds.length > 0) {
        // Use secure function to get counts without exposing individual prayer activity
        const { data: countsData } = await supabase
          .rpc('get_prayer_counts', { prayer_ids: prayerIds });

        if (countsData) {
          countsData.forEach((item: { prayer_request_id: string; count: number }) => {
            prayerCounts[item.prayer_request_id] = item.count;
          });
        }

        // User can still see their own prayers (allowed by RLS)
        if (user) {
          const { data: userPrayersData } = await supabase
            .from('user_prayers')
            .select('prayer_request_id')
            .eq('user_id', user.id)
            .in('prayer_request_id', prayerIds);

          if (userPrayersData) {
            userPrayersData.forEach(up => userPrayers.add(up.prayer_request_id));
          }
        }
      }

      const formattedPrayers: PrayerRequest[] = (prayerData || []).map(prayer => ({
        id: prayer.id,
        user_id: prayer.user_id || '', // user_id is null for anonymous requests
        title: prayer.title,
        description: prayer.description,
        theme_id: prayer.theme_id,
        is_anonymous: prayer.is_anonymous || false,
        is_pinned: prayer.is_pinned || false,
        is_deleted: false, // View only returns non-deleted
        created_at: prayer.created_at,
        prayer_count: prayerCounts[prayer.id] || 0,
        has_prayed: userPrayers.has(prayer.id),
        author: prayer.is_anonymous || !prayer.user_id ? undefined : profilesMap[prayer.user_id] || { display_name: 'App da Oração', photo_url: null, verified: false }
      }));

      if (append) {
        setPrayers(prev => [...prev, ...formattedPrayers]);
      } else {
        setPrayers(formattedPrayers);
      }

      setHasMore(formattedPrayers.length === pageSize);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user, options.themeFilter, options.searchQuery, pageSize]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPrayers(nextPage, true);
    }
  }, [page, loadingMore, hasMore, fetchPrayers]);

  const refresh = useCallback(() => {
    setPage(0);
    fetchPrayers(0);
  }, [fetchPrayers]);

  const togglePrayer = useCallback(async (prayerId: string) => {
    if (!user) {
      toast.error('Faça login para orar por este pedido');
      return;
    }

    const prayer = prayers.find(p => p.id === prayerId);
    if (!prayer) return;

    try {
      if (prayer.has_prayed) {
        await supabase
          .from('user_prayers')
          .delete()
          .eq('user_id', user.id)
          .eq('prayer_request_id', prayerId);
        
        setPrayers(prev => prev.map(p => 
          p.id === prayerId 
            ? { ...p, has_prayed: false, prayer_count: p.prayer_count - 1 }
            : p
        ));
      } else {
        await supabase
          .from('user_prayers')
          .insert({ user_id: user.id, prayer_request_id: prayerId });
        
        setPrayers(prev => prev.map(p => 
          p.id === prayerId 
            ? { ...p, has_prayed: true, prayer_count: p.prayer_count + 1 }
            : p
        ));
        
        toast.success('Obrigado por orar! 🙏');
      }
    } catch (error) {
      console.error('Error toggling prayer:', error);
      toast.error('Erro ao registrar oração');
    }
  }, [user, prayers]);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  useEffect(() => {
    setPage(0);
    fetchPrayers(0);
  }, [options.themeFilter, options.searchQuery]);

  return {
    prayers,
    themes,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    refresh,
    togglePrayer
  };
}
