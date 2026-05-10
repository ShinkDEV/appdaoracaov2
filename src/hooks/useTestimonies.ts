import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Testimony {
  id: string;
  user_id: string | null;
  prayer_request_id: string | null;
  title: string;
  content: string;
  is_anonymous: boolean;
  likes_count: number;
  created_at: string;
  author_display_name: string | null;
  author_photo_url: string | null;
  author_verified: boolean;
  author_is_supporter: boolean;
  has_liked?: boolean;
}

export function useTestimonies() {
  const { user } = useAuth();
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTestimonies = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_public_testimonies', {
      p_limit: 50,
      p_offset: 0,
    });

    if (error) {
      toast.error('Erro ao carregar testemunhos');
      setLoading(false);
      return;
    }

    let likedIds = new Set<string>();
    if (user && data && data.length > 0) {
      const ids = data.map((t: any) => t.id);
      const { data: likes } = await supabase
        .from('testimony_likes')
        .select('testimony_id')
        .eq('user_id', user.id)
        .in('testimony_id', ids);
      likedIds = new Set((likes || []).map((l: any) => l.testimony_id));
    }

    setTestimonies(
      (data || []).map((t: any) => ({ ...t, has_liked: likedIds.has(t.id) }))
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTestimonies();
  }, [fetchTestimonies]);

  const createTestimony = async (input: {
    title: string;
    content: string;
    is_anonymous: boolean;
    prayer_request_id?: string | null;
  }) => {
    if (!user) {
      toast.error('Faça login para compartilhar um testemunho');
      return false;
    }
    const { error } = await supabase.from('testimonies').insert({
      user_id: user.id,
      title: input.title,
      content: input.content,
      is_anonymous: input.is_anonymous,
      prayer_request_id: input.prayer_request_id || null,
    });
    if (error) {
      toast.error('Erro ao publicar testemunho');
      return false;
    }
    toast.success('Testemunho publicado! 🙌');
    await fetchTestimonies();
    return true;
  };

  const toggleLike = async (testimonyId: string) => {
    if (!user) {
      toast.error('Faça login para curtir');
      return;
    }
    const t = testimonies.find((x) => x.id === testimonyId);
    if (!t) return;

    // Optimistic
    setTestimonies((prev) =>
      prev.map((x) =>
        x.id === testimonyId
          ? {
              ...x,
              has_liked: !x.has_liked,
              likes_count: x.likes_count + (x.has_liked ? -1 : 1),
            }
          : x
      )
    );

    if (t.has_liked) {
      await supabase
        .from('testimony_likes')
        .delete()
        .eq('testimony_id', testimonyId)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('testimony_likes')
        .insert({ testimony_id: testimonyId, user_id: user.id });
    }
  };

  const deleteTestimony = async (testimonyId: string) => {
    const { error } = await supabase
      .from('testimonies')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', testimonyId);
    if (error) {
      toast.error('Erro ao excluir testemunho');
      return;
    }
    toast.success('Testemunho excluído');
    await fetchTestimonies();
  };

  return { testimonies, loading, createTestimony, toggleLike, deleteTestimony, refetch: fetchTestimonies };
}
